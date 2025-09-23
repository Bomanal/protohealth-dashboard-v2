import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Check } from "lucide-react"

import { IdentifyPatientsStep } from "./outbound-wizard/IdentifyPatientsStep"
import { ScheduleCallStep } from "./outbound-wizard/ScheduleCallStep" 
import { ReviewGoLiveStep } from "./outbound-wizard/ReviewGoLiveStep"

export interface PatientData {
  id?: string
  name: string
  dob: string
  gender: string
  callType: string
  medicalConditions: string
  additionalNotes: string
}

export interface OutboundCallData {
  patients: PatientData[]
  schedulingOption: 'now' | 'best_time' | 'custom'
  customDateTime?: Date
  selectedProtocol?: string
}

const STEPS = [
  { id: 1, title: "Identify Patients", description: "Patient information" },
  { id: 2, title: "Schedule Call", description: "Call timing" },
  { id: 3, title: "Review & Go Live", description: "Final review" }
]

export function TriggerOutboundCallsWizard() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [callData, setCallData] = useState<OutboundCallData>({
    patients: [],
    schedulingOption: 'now'
  })

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Trigger the outbound calls
    navigate('/all-engagements')
  }

  const updateCallData = (updates: Partial<OutboundCallData>) => {
    setCallData(prev => ({ ...prev, ...updates }))
  }

  const progress = (currentStep / 3) * 100

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <IdentifyPatientsStep
            data={callData}
            onUpdate={updateCallData}
            onNext={handleNext}
          />
        )
      case 2:
        return (
          <ScheduleCallStep
            data={callData}
            onUpdate={updateCallData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 3:
        return (
          <ReviewGoLiveStep
            data={callData}
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
              <Button variant="ghost" size="sm" onClick={() => navigate('/all-engagements')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patient Interactions
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
                  Trigger Outbound Calls
                </h1>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep} of 3: {STEPS[currentStep - 1]?.title}
                </p>
              </div>
            </div>
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
                } else {
                  stepState = 'bg-muted text-muted-foreground'
                }
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${stepState}`}>
                      {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
                    </div>
                    <div className="text-xs text-center mt-1 max-w-20">
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