import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtocolData } from "../CreateProtocolWizard"
import { ArrowLeft, ArrowRight, Upload, FileText, Loader2 } from "lucide-react"
import { useProtocolEngine } from "@/hooks/useProtocolEngine"


interface UploadProtocolStepProps {
  data: ProtocolData
  onUpdate: (updates: Partial<ProtocolData>) => void
  onNext: () => void
  onBack: () => void
}

export function UploadProtocolStep({ data, onUpdate, onNext, onBack }: UploadProtocolStepProps) {
  const [dragActive, setDragActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('')
  const { uploadProtocolData, loading, error } = useProtocolEngine()


  const handleFileUpload = (file: File) => {
    onUpdate({ uploadedFile: file, uploadMethod: 'file' })
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (isValidFileType(file)) {
        handleFileUpload(file)
      }
    }
  }

  const isValidFileType = (file: File) => {
    // Only allow .txt files for now as per API requirements
    return file.name.endsWith('.txt') || file.type === 'text/plain'
  }

  const handleNext = async () => {
    if (data.uploadedFile && data.protocol_internal_id) {
      try {
        setIsProcessing(true)
        setProcessingStatus('Uploading file...')
        
        const response = await uploadProtocolData(data.protocol_internal_id, data.uploadedFile)
        
        onUpdate({ 
          uploadMethod: 'file',
          task_id: response.task_id
        })
        
        setProcessingStatus('Processing protocol with AI...')
        await pollForCompletion(data.protocol_internal_id)
        
        setProcessingStatus('Processing complete!')
        onNext()
      } catch (err) {
        console.error('Failed to upload protocol data:', err)
        setProcessingStatus('Processing failed')
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const pollForCompletion = async (protocolInternalId: string) => {
    const maxAttempts = 120 // 10 minutes max wait (120 attempts * 5 seconds = 600 seconds = 10 minutes)
    let attempts = 0
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`/protocol_engine/status/${protocolInternalId}`)
        const statusData = await response.json()
        
        if (statusData.protocol_status === 'COMPLETED') {
          console.log('Protocol processing completed successfully')
          return
        } else if (statusData.protocol_status === 'FAILED') {
          throw new Error('Protocol processing failed')
        }
        
        // Wait 5 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 5000))
        attempts++
      } catch (err) {
        console.error('Error polling status:', err)
        throw err
      }
    }
    
    throw new Error('Protocol processing timed out after 10 minutes')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Protocol Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="max-w-2xl mx-auto">
            {/* File Upload Option */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">

              <CardContent className="p-6">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Upload New Protocol</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload a protocol document (TXT files only)
                  </p>

                  <div className="space-y-4">
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                        dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {data.uploadedFile ? (
                        <div className="text-center">
                          <FileText className="h-8 w-8 text-success mx-auto mb-2" />
                          <p className="font-medium">{data.uploadedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(data.uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p>Drag and drop your file here, or click to browse</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Supports TXT files only
                          </p>
                        </div>
                      )}
                    </div>

                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file && isValidFileType(file)) {
                          handleFileUpload(file)
                        }
                      }}
                    />
                    
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="w-full"
                    >
                      Choose File
                    </Button>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={onBack} disabled={loading}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!data.uploadedFile || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    Continue to Visualization
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}