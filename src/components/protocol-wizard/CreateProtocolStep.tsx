import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtocolData } from "../CreateProtocolWizard"
import { ArrowRight, FileText, Loader2 } from "lucide-react"
import { useProtocolEngine } from "@/hooks/useProtocolEngine"

interface CreateProtocolStepProps {
  data: ProtocolData
  onUpdate: (updates: Partial<ProtocolData>) => void
  onNext: () => void
}

export function CreateProtocolStep({ data, onUpdate, onNext }: CreateProtocolStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { createProtocol, loading, error } = useProtocolEngine()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Remove all validation - make fields optional
    const newErrors: Record<string, string> = {}
    
    if (!data.name.trim()) newErrors.name = "Protocol name is required"
    if (!data.entryPoint.trim()) newErrors.entryPoint = "Entry point is required"
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      try {
        // Generate protocol_internal_id from name and entry point
        const protocolInternalId = `${data.name.toLowerCase().replace(/\s+/g, '_')}_${data.entryPoint.toLowerCase().replace(/\s+/g, '_')}`
        
        // Create protocol via API
        const response = await createProtocol({
          protocol_internal_id: protocolInternalId,
          protocol_name: data.name,
          protocol_description: data.description
        })
        
        // Update protocol data with API response
        onUpdate({
          protocol_id: response.protocol_id,
          protocol_internal_id: response.protocol_internal_id
        })
        
        onNext()
      } catch (err) {
        console.error('Failed to create protocol:', err)
        // Error is handled by the hook
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Create new inbound protocol
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Protocol Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder="e.g., Chest Pain Assessment Protocol"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Describe the purpose and scope of this triage protocol..."
                rows={4}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Medical Specialty</Label>
              <Select value={data.specialty} onValueChange={(value) => onUpdate({ specialty: value })}>
                <SelectTrigger className={errors.specialty ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select medical specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="gastroenterology">Gastroenterology</SelectItem>
                  <SelectItem value="general">General Medicine</SelectItem>
                  <SelectItem value="emergency">Emergency Medicine</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="dermatology">Dermatology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                </SelectContent>
              </Select>
              {errors.specialty && (
                <p className="text-sm text-destructive">{errors.specialty}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryPoint">Entry Point</Label>
              <Input
                id="entryPoint"
                value={data.entryPoint}
                onChange={(e) => onUpdate({ entryPoint: e.target.value })}
                placeholder="e.g., Patient calls with chest pain complaints"
                className={errors.entryPoint ? "border-destructive" : ""}
              />
              {errors.entryPoint && (
                <p className="text-sm text-destructive">{errors.entryPoint}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Describe how patients will enter this protocol (symptoms, chief complaint, etc.)
              </p>
            </div>

            <div className="space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Protocol...
                  </>
                ) : (
                  <>
                    Continue to Upload
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
              
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}