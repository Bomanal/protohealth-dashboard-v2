import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react"
import { protocolService, useProtocolAction, type ProtocolDetail } from "@/hooks/useProtocolEngine"

interface ProtocolApprovalBarProps {
  protocolId: string | null
  /** Bumped by the parent after a save so the bar re-reads the protocol's versions. */
  refreshKey?: number
  /** Approval is blocked while there are unsaved edits. */
  pendingChanges?: number
  onApproved?: () => void
}

/**
 * Review status of a protocol (draft / approved, version numbers) and the clinician approval action.
 * Calls run only the approved (active) version; a newer draft must be approved to go live.
 */
export function ProtocolApprovalBar({ protocolId, refreshKey = 0, pendingChanges = 0, onApproved }: ProtocolApprovalBarProps) {
  const [detail, setDetail] = useState<ProtocolDetail | null>(null)
  const [open, setOpen] = useState(false)
  const [reviewer, setReviewer] = useState("")
  const { run, loading, error, setError } = useProtocolAction()

  const load = useCallback(async () => {
    if (!protocolId) return setDetail(null)
    const d = await run(() => protocolService.get(protocolId))
    if (d) setDetail(d)
  }, [protocolId, run])

  useEffect(() => { load() }, [load, refreshKey])

  if (!protocolId || !detail) return null
  const active = detail.active_version
  const editable = detail.editable_version
  const needsApproval = editable && editable.status === "draft"

  const approve = async () => {
    if (!editable || !reviewer.trim()) return setError("Enter the reviewing clinician's name")
    const ok = await run(() => protocolService.approve(protocolId, editable.version_id, reviewer.trim()))
    if (ok) {
      setOpen(false)
      await load()
      onApproved?.()
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 bg-muted/20">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <ShieldCheck className="h-4 w-4 text-primary" />
        {active ? (
          <Badge variant="default">Live: v{active.version} approved by {active.reviewed_by}</Badge>
        ) : (
          <Badge variant="outline">Not live: no approved version</Badge>
        )}
        {needsApproval && <Badge variant="secondary">Draft v{editable.version} awaiting review</Badge>}
      </div>
      {needsApproval && (
        <Button size="sm" onClick={() => { setError(null); setOpen(true) }} disabled={pendingChanges > 0}
                title={pendingChanges > 0 ? "Save your changes before approving" : undefined}>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Approve v{editable.version}
        </Button>
      )}
      {error && !open && <p className="w-full text-sm text-destructive">{error}</p>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve {detail.name} v{editable?.version}</DialogTitle>
            <DialogDescription>
              Once approved, this version is what patient calls use{active ? ` (replacing v${active.version})` : ""}.
              Approve only after a clinician has reviewed every thread or script.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reviewer">Reviewing clinician</Label>
            <Input id="reviewer" value={reviewer} onChange={(e) => setReviewer(e.target.value)} placeholder="e.g., Dr. Jane Smith, RN" />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={approve} disabled={loading || !reviewer.trim()}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Approve and make live
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
