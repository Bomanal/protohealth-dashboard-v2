import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProtocolData } from "../CreateProtocolWizard"
import { ArrowRight, FileText, PhoneIncoming, PhoneOutgoing } from "lucide-react"

interface CreateProtocolStepProps {
  data: ProtocolData
  onUpdate: (updates: Partial<ProtocolData>) => void
  onNext: () => void
}

const NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 _-]{1,99}$/

export function CreateProtocolStep({ data, onUpdate, onNext }: CreateProtocolStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!NAME_PATTERN.test(data.name.trim())) {
      newErrors.name = "2-100 characters: letters, digits, spaces, '-' or '_'"
    }
    if (data.kind === "outbound" && !data.procedureType.trim()) {
      newErrors.procedureType = "The procedure this call is for is required"
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) onNext()
  }

  const kindButton = (kind: "inbound" | "outbound", title: string, subtitle: string, Icon: typeof PhoneIncoming) => (
    <button
      type="button"
      onClick={() => onUpdate({ kind })}
      className={`flex-1 rounded-lg border p-4 text-left transition-colors ${
        data.kind === kind ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
      }`}
    >
      <div className="flex items-center gap-2 font-medium">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </div>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </button>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Create a protocol
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Protocol type</Label>
              <div className="flex gap-3">
                {kindButton("inbound", "Inbound triage", "A patient calls with a symptom (decision threads).", PhoneIncoming)}
                {kindButton("outbound", "Outbound procedure call", "The clinic calls a patient about a procedure.", PhoneOutgoing)}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Protocol name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder={data.kind === "inbound" ? "e.g., Abdominal Pain Adults" : "e.g., Knee Arthroscopy Prep"}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              <p className="text-sm text-muted-foreground">
                Uploading again with the same name adds a new version of the same protocol.
              </p>
            </div>

            {data.kind === "outbound" && (
              <div className="space-y-2">
                <Label htmlFor="procedure">Procedure</Label>
                <Input
                  id="procedure"
                  value={data.procedureType}
                  onChange={(e) => onUpdate({ procedureType: e.target.value })}
                  placeholder="e.g., knee arthroscopy"
                  className={errors.procedureType ? "border-destructive" : ""}
                />
                {errors.procedureType && <p className="text-sm text-destructive">{errors.procedureType}</p>}
                <p className="text-sm text-muted-foreground">
                  Outbound calls for patients scheduled for this procedure will use this protocol once approved.
                </p>
              </div>
            )}

            <Button type="submit" className="w-full">
              Continue to Upload
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
