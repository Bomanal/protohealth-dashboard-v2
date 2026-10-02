import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtocolData } from "../CreateProtocolWizard"
import { ArrowLeft, ArrowRight, Upload, FileText, Loader2 } from "lucide-react"
import { protocolService, waitForGeneration } from "@/hooks/useProtocolEngine"

interface UploadProtocolStepProps {
  data: ProtocolData
  onUpdate: (updates: Partial<ProtocolData>) => void
  onNext: () => void
  onBack: () => void
}

const isValidFileType = (file: File) => /\.(txt|md)$/i.test(file.name)
const MAX_BYTES = 500_000

export function UploadProtocolStep({ data, onUpdate, onNext, onBack }: UploadProtocolStepProps) {
  const [dragActive, setDragActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState("")
  const [stepError, setStepError] = useState<string | null>(null)

  const handleFile = (file: File | undefined) => {
    setStepError(null)
    if (!file) return
    if (!isValidFileType(file)) {
      setStepError("Upload the protocol as a .txt or .md text file.")
      return
    }
    if (file.size > MAX_BYTES) {
      setStepError("The document is larger than 500 KB.")
      return
    }
    onUpdate({ uploadedFile: file })
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const handleNext = async () => {
    if (!data.uploadedFile) return
    setStepError(null)
    setIsProcessing(true)
    try {
      setProcessingStatus("Uploading document...")
      const upload = await protocolService.upload({
        file: data.uploadedFile,
        kind: data.kind,
        name: data.name.trim(),
        procedureType: data.kind === "outbound" ? data.procedureType.trim() : undefined,
      })
      onUpdate({ protocol_id: upload.protocol_id, version_id: upload.version_id })
      setProcessingStatus("Generating the protocol from the document (this usually takes 1-3 minutes)...")
      await waitForGeneration(upload.protocol_id, upload.version_id, (elapsed) =>
        setProcessingStatus(`Generating the protocol from the document... ${elapsed}s`))
      setProcessingStatus("Draft ready")
      onNext()
    } catch (err) {
      setProcessingStatus("")
      setStepError(err instanceof Error ? err.message : "Protocol processing failed")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload the {data.kind === "inbound" ? "triage guideline" : "procedure protocol"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-muted-foreground mb-4">
              {data.kind === "inbound"
                ? "The guideline is converted into decision threads (one per clinical criterion, each with an urgency) and saved as a draft for review."
                : "The protocol is converted into the call script: items read word for word, medication hold times and edge cases, saved as a draft for review."}
            </p>
            <div
              className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {data.uploadedFile ? (
                <div>
                  <FileText className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="font-medium">{data.uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">{(data.uploadedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p>Drag and drop your file here, or choose a file</p>
                  <p className="text-sm text-muted-foreground mt-1">.txt or .md, up to 500 KB</p>
                </div>
              )}
            </div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".txt,.md"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}
                    className="w-full mt-4" disabled={isProcessing}>
              Choose File
            </Button>
          </div>

          {stepError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive whitespace-pre-wrap">{stepError}</p>
            </div>
          )}
          {isProcessing && processingStatus && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {processingStatus}
            </p>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack} disabled={isProcessing}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleNext} disabled={!data.uploadedFile || isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Upload and Generate
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
