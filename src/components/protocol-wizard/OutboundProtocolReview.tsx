import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Check, Loader2, PhoneOutgoing } from "lucide-react"
import { protocolService, useProtocolAction, type ProtocolDetail } from "@/hooks/useProtocolEngine"
import { ProtocolApprovalBar } from "./ProtocolApprovalBar"

interface KbEntry { script?: string; guidance?: string }

interface OutboundProtocolReviewProps {
  protocolId: string
  onBack: () => void
  onDone: () => void
}

/** Read-only review of a generated outbound call protocol: scripts read verbatim, medication holds, edge cases. */
export function OutboundProtocolReview({ protocolId, onBack, onDone }: OutboundProtocolReviewProps) {
  const [detail, setDetail] = useState<ProtocolDetail | null>(null)
  const { run, loading, error } = useProtocolAction()

  const load = useCallback(async () => {
    const d = await run(() => protocolService.get(protocolId))
    if (d) setDetail(d)
  }, [protocolId, run])
  useEffect(() => { load() }, [load])

  const bundle = detail?.bundle
  const prep = bundle?.topics_of_discussion?.prep_discussion
  const sequence: string[] = prep?.sequence ?? []
  const kb: Record<string, KbEntry | string> = prep?.knowledge_base ?? {}
  const holds: { names: string[]; hold: string }[] = bundle?.medication_holds ?? []
  const edgeCases: { scenario: string; handling: string }[] = bundle?.edge_case_scenarios ?? []
  const notes: string[] = bundle?.review?.notes ?? []

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneOutgoing className="h-5 w-5 text-primary" />
            {detail?.title ?? detail?.name ?? protocolId} call protocol
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProtocolApprovalBar protocolId={protocolId} />
          {loading && !detail && <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Loading...</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {notes.length > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 space-y-1">
              {notes.map((n, i) => <p key={i}>{n}</p>)}
            </div>
          )}

          <section className="space-y-3">
            <h3 className="font-semibold">Call items ({sequence.length}), read to the patient word for word</h3>
            {sequence.map((item, i) => {
              const entry = kb[item]
              const script = typeof entry === "string" ? entry : entry?.script
              const guidance = typeof entry === "string" ? undefined : entry?.guidance
              return (
                <div key={item} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 font-medium">
                    <Badge variant="outline">{i + 1}</Badge>{item}
                    {!script && <Badge variant="destructive">no script</Badge>}
                  </div>
                  {script && <p className="mt-2 text-sm">"{script}"</p>}
                  {guidance && <p className="mt-2 text-xs text-muted-foreground">Handling: {guidance}</p>}
                </div>
              )
            })}
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold">Medication holds ({holds.length})</h3>
            {holds.length === 0 ? (
              <p className="text-sm text-muted-foreground">None. The bot will not give any hold times.</p>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Medicines</TableHead><TableHead>Stop before procedure</TableHead></TableRow></TableHeader>
                <TableBody>
                  {holds.map((h, i) => (
                    <TableRow key={i}><TableCell>{h.names.join(", ")}</TableCell><TableCell>{h.hold}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold">Edge cases ({edgeCases.length})</h3>
            {edgeCases.map((c, i) => (
              <p key={i} className="text-sm"><span className="font-medium">{c.scenario}</span>: {c.handling}</p>
            ))}
          </section>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
            <Button onClick={onDone}><Check className="h-4 w-4 mr-2" />Finish</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
