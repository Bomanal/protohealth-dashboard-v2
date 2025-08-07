import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  // API response fields
  protocol_id?: string
  protocol_internal_id?: string
  task_id?: string

}

const STEPS = [
  { id: 1, title: "Create Protocol", description: "Basic information" },
  { id: 2, title: "Upload Protocol", description: "Upload or import data" },
  { id: 3, title: "Visualize Protocol", description: "Review decision tree" },
  { id: 4, title: "Review Simulations", description: "Test scenarios" },
  { id: 5, title: "Run Simulations", description: "Live testing" }
]

const ACTIVE_STEPS = 3 // Only first 3 steps are functional

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
    if (currentStep < ACTIVE_STEPS) {

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

  const progress = (currentStep / ACTIVE_STEPS) * 100


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
            onNext={handleComplete}

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
              <h1 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
                Create {protocolData.name || "New Protocol"} Flow
              </h1>
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of {ACTIVE_STEPS}: {STEPS[currentStep - 1]?.title}

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
              {STEPS.map((step) => {
                let stepState = ''
                if (step.id < currentStep) {
                  stepState = 'bg-primary text-primary-foreground'
                } else if (step.id === currentStep) {
                  stepState = 'bg-primary/20 text-primary border-2 border-primary'
                } else if (step.id <= ACTIVE_STEPS) {
                  stepState = 'bg-muted text-muted-foreground'
                } else {
                  // Future steps (4 & 5) - disabled state
                  stepState = 'bg-muted/50 text-muted-foreground/50'
                }
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${stepState}`}>
                      {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
                    </div>
                    <div className={`text-xs text-center mt-1 max-w-20 ${step.id > ACTIVE_STEPS ? 'opacity-50' : ''}`}>
                      <div className="font-medium">{step.title}</div>
                    </div>
                  </div>
                )
              })}

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