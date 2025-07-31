import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { CreateProtocolStep } from "./protocol-wizard/CreateProtocolStep"
import { UploadProtocolStep } from "./protocol-wizard/UploadProtocolStep"
import { VisualizeProtocolStep } from "./protocol-wizard/VisualizeProtocolStep"
import { ReviewSimulationsStep } from "./protocol-wizard/ReviewSimulationsStep"
import { RunSimulationsStep } from "./protocol-wizard/RunSimulationsStep"

export interface ProtocolData {
  name: string
  description: string
  specialty: string
  entryPoint: string
  uploadMethod?: 'file' | 'call-data'
  uploadedFile?: File
}

const STEPS = [
  { id: 1, title: "Create Protocol", description: "Basic information" },
  { id: 2, title: "Upload Protocol", description: "Upload or import data" },
  { id: 3, title: "Visualize Protocol", description: "Review decision tree" },
  { id: 4, title: "Review Simulations", description: "Test scenarios" },
  { id: 5, title: "Run Simulations", description: "Live testing" }
]

export function CreateProtocolWizard() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [protocolData, setProtocolData] = useState<ProtocolData>({
    name: "",
    description: "",
    specialty: "",
    entryPoint: ""
  })

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Save as completed protocol
    navigate('/inbound-triage')
  }

  const handleSaveDraft = () => {
    // Save as draft protocol
    navigate('/inbound-triage')
  }

  const updateProtocolData = (updates: Partial<ProtocolData>) => {
    setProtocolData(prev => ({ ...prev, ...updates }))
  }

  const progress = (currentStep / STEPS.length) * 100

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CreateProtocolStep
            data={protocolData}
            onUpdate={updateProtocolData}
            onNext={handleNext}
          />
        )
      case 2:
        return (
          <UploadProtocolStep
            data={protocolData}
            onUpdate={updateProtocolData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 3:
        return (
          <VisualizeProtocolStep
            data={protocolData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 4:
        return (
          <ReviewSimulationsStep
            data={protocolData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 5:
        return (
          <RunSimulationsStep
            data={protocolData}
            onComplete={handleComplete}
            onBack={handleBack}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/inbound-triage')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Protocols
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-xl font-semibold">
                  {protocolData.name || "New Protocol"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.title}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSaveDraft}>
              Save as Draft
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-6 py-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            {/* Step indicators */}
            <div className="flex justify-between">
              {STEPS.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id < currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : step.id === currentStep 
                        ? 'bg-primary/20 text-primary border-2 border-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  <div className="text-xs text-center mt-1 max-w-20">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-muted-foreground">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {renderStep()}
      </div>
    </div>
  )
}