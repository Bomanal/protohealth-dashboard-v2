import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtocolData } from "../CreateProtocolWizard"
import { ArrowLeft, ArrowRight, Upload, FileText, Phone, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UploadProtocolStepProps {
  data: ProtocolData
  onUpdate: (updates: Partial<ProtocolData>) => void
  onNext: () => void
  onBack: () => void
}

export function UploadProtocolStep({ data, onUpdate, onNext, onBack }: UploadProtocolStepProps) {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'call-data' | null>(data.uploadMethod || null)
  const [dragActive, setDragActive] = useState(false)

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
    const validTypes = ['application/pdf', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    return validTypes.includes(file.type)
  }

  const handleNext = () => {
    if (uploadMethod) {
      onUpdate({ uploadMethod })
      onNext()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Protocol Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Upload Option */}
            <Card className={`cursor-pointer transition-all ${uploadMethod === 'file' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
              <CardContent className="p-6">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Upload New Protocol</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload a protocol document (PDF, PNG, or DOCX)
                  </p>

                  {uploadMethod === 'file' ? (
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
                              Supports PDF, PNG, DOCX
                            </p>
                          </div>
                        )}
                      </div>

                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".pdf,.png,.docx"
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
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setUploadMethod('file')}
                      className="w-full"
                    >
                      Select This Option
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Call Data Option */}
            <Card className={`cursor-pointer transition-all ${uploadMethod === 'call-data' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
              <CardContent className="p-6">
                <div className="text-center">
                  <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Use Existing Call Data</h3>
                  <p className="text-muted-foreground mb-4">
                    Import from your existing patient call recordings
                  </p>

                  {uploadMethod === 'call-data' ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please contact the Proto Health team for assistance with uploading your call data. 
                        Our team will help you securely import and process your existing patient interaction data.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setUploadMethod('call-data')}
                      className="w-full"
                    >
                      Select This Option
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!uploadMethod || (uploadMethod === 'file' && !data.uploadedFile)}
            >
              Continue to Visualization
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}