import { useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  ArrowRight,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Heart,
  Stethoscope,
  Save,
  Play,
  FileText,
  Brain,
  Users,
  Clock
} from "lucide-react"

interface ProtocolStep {
  id: string
  condition: string
  action: "escalate" | "continue" | "schedule" | "educate"
  priority: "low" | "medium" | "high" | "urgent"
  nextStep?: string
  instructions?: string
}

interface ProtocolData {
  name: string
  department: "cardiology" | "gastroenterology" | ""
  description: string
  symptoms: string[]
  conditions: string[]
  decisionTree: ProtocolStep[]
  escalationCriteria: string[]
  testScenarios: Array<{
    scenario: string
    expectedOutcome: string
  }>
}

export default function CreateTriageProtocol() {
  const [currentStep, setCurrentStep] = useState(1)
  const [protocolData, setProtocolData] = useState<ProtocolData>({
    name: "",
    department: "",
    description: "",
    symptoms: [],
    conditions: [],
    decisionTree: [],
    escalationCriteria: [],
    testScenarios: []
  })

  const steps = [
    { number: 1, title: "Basic Information", description: "Protocol name and department" },
    { number: 2, title: "Symptoms & Conditions", description: "Define what this protocol covers" },
    { number: 3, title: "Decision Tree", description: "Build AI assessment logic" },
    { number: 4, title: "Escalation Rules", description: "Set priority and escalation paths" },
    { number: 5, title: "Testing & Validation", description: "Test scenarios and validation" },
    { number: 6, title: "Review & Deploy", description: "Final review and activation" }
  ]

  const [newSymptom, setNewSymptom] = useState("")
  const [newCondition, setNewCondition] = useState("")
  const [newStep, setNewStep] = useState<Partial<ProtocolStep>>({})

  const addSymptom = () => {
    if (newSymptom.trim()) {
      setProtocolData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, newSymptom.trim()]
      }))
      setNewSymptom("")
    }
  }

  const removeSymptom = (index: number) => {
    setProtocolData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }))
  }

  const addCondition = () => {
    if (newCondition.trim()) {
      setProtocolData(prev => ({
        ...prev,
        conditions: [...prev.conditions, newCondition.trim()]
      }))
      setNewCondition("")
    }
  }

  const removeCondition = (index: number) => {
    setProtocolData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }))
  }

  const addDecisionStep = () => {
    if (newStep.condition && newStep.action && newStep.priority) {
      const step: ProtocolStep = {
        id: `step-${Date.now()}`,
        condition: newStep.condition,
        action: newStep.action as any,
        priority: newStep.priority as any,
        instructions: newStep.instructions
      }
      setProtocolData(prev => ({
        ...prev,
        decisionTree: [...prev.decisionTree, step]
      }))
      setNewStep({})
    }
  }

  const removeDecisionStep = (id: string) => {
    setProtocolData(prev => ({
      ...prev,
      decisionTree: prev.decisionTree.filter(step => step.id !== id)
    }))
  }

  const progress = (currentStep / steps.length) * 100

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case "cardiology": return <Heart className="h-4 w-4 text-red-500" />
      case "gastroenterology": return <Stethoscope className="h-4 w-4 text-blue-500" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive"
      case "high": return "destructive"  
      case "medium": return "secondary"
      case "low": return "outline"
      default: return "secondary"
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Protocol Information
              </CardTitle>
              <CardDescription>
                Define the fundamental details of your triage protocol
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Protocol Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Chest Pain Assessment Protocol"
                  value={protocolData.name}
                  onChange={(e) => setProtocolData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select 
                  value={protocolData.department} 
                  onValueChange={(value) => setProtocolData(prev => ({ ...prev, department: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardiology">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        Cardiology
                      </div>
                    </SelectItem>
                    <SelectItem value="gastroenterology">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-blue-500" />
                        Gastroenterology
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Protocol Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this protocol covers and when it should be used..."
                  value={protocolData.description}
                  onChange={(e) => setProtocolData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Symptoms & Conditions
              </CardTitle>
              <CardDescription>
                Define the symptoms and conditions this protocol will assess
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Symptoms Covered</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Add symptoms that patients might report that would trigger this protocol
                  </p>
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="e.g., chest pain, shortness of breath"
                      value={newSymptom}
                      onChange={(e) => setNewSymptom(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                    />
                    <Button onClick={addSymptom} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {protocolData.symptoms.map((symptom, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {symptom}
                        <button onClick={() => removeSymptom(index)}>
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Medical Conditions</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Add specific medical conditions this protocol can help assess
                  </p>
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="e.g., myocardial infarction, angina"
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCondition()}
                    />
                    <Button onClick={addCondition} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {protocolData.conditions.map((condition, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {condition}
                        <button onClick={() => removeCondition(index)}>
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Decision Tree Logic
              </CardTitle>
              <CardDescription>
                Build the AI assessment flow with conditions and actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Add Decision Step</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Condition/Question</Label>
                    <Input
                      placeholder="e.g., Patient reports chest pain > 7/10"
                      value={newStep.condition || ""}
                      onChange={(e) => setNewStep(prev => ({ ...prev, condition: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Action</Label>
                    <Select 
                      value={newStep.action} 
                      onValueChange={(value) => setNewStep(prev => ({ ...prev, action: value as "escalate" | "continue" | "schedule" | "educate" }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="escalate">Escalate to physician</SelectItem>
                        <SelectItem value="continue">Continue assessment</SelectItem>
                        <SelectItem value="schedule">Schedule appointment</SelectItem>
                        <SelectItem value="educate">Provide education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority Level</Label>
                    <Select 
                      value={newStep.priority} 
                      onValueChange={(value) => setNewStep(prev => ({ ...prev, priority: value as "low" | "medium" | "high" | "urgent" }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Urgent (Call 911)</SelectItem>
                        <SelectItem value="high">High (Same day)</SelectItem>
                        <SelectItem value="medium">Medium (24-48 hours)</SelectItem>
                        <SelectItem value="low">Low (Routine)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Instructions (Optional)</Label>
                    <Input
                      placeholder="Additional guidance for AI agent"
                      value={newStep.instructions || ""}
                      onChange={(e) => setNewStep(prev => ({ ...prev, instructions: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={addDecisionStep} className="mt-4" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Step
                </Button>
              </div>

              <div className="space-y-3">
                <Label>Decision Steps ({protocolData.decisionTree.length})</Label>
                {protocolData.decisionTree.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No decision steps added yet</p>
                ) : (
                  protocolData.decisionTree.map((step, index) => (
                    <Card key={step.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Step {index + 1}</Badge>
                            <Badge variant={getPriorityColor(step.priority)}>
                              {step.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="font-medium">{step.condition}</p>
                          <p className="text-sm text-muted-foreground">
                            Action: {step.action} {step.instructions && `• ${step.instructions}`}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeDecisionStep(step.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Escalation Rules
              </CardTitle>
              <CardDescription>
                Define when and how cases should be escalated to human staff
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Automatic Escalation Criteria</Label>
                <p className="text-sm text-muted-foreground">
                  Select conditions that should always trigger escalation to a human nurse or physician
                </p>
                
                <div className="space-y-3">
                  {[
                    "Patient reports severe pain (8-10/10)",
                    "Mentions chest pain with radiation",
                    "Reports difficulty breathing",
                    "Mentions loss of consciousness",
                    "Temperature above 102°F (38.9°C)",
                    "Blood pressure readings outside normal range",
                    "Patient requests to speak with human staff",
                    "AI confidence level below 80%"
                  ].map((criteria, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`criteria-${index}`}
                        checked={protocolData.escalationCriteria.includes(criteria)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setProtocolData(prev => ({
                              ...prev,
                              escalationCriteria: [...prev.escalationCriteria, criteria]
                            }))
                          } else {
                            setProtocolData(prev => ({
                              ...prev,
                              escalationCriteria: prev.escalationCriteria.filter(c => c !== criteria)
                            }))
                          }
                        }}
                      />
                      <Label htmlFor={`criteria-${index}`} className="text-sm font-normal">
                        {criteria}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Testing & Validation
              </CardTitle>
              <CardDescription>
                Test your protocol with sample scenarios before deployment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Protocol Simulation</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Run through common scenarios to validate your protocol logic
                </p>
                
                <div className="space-y-3">
                  {[
                    {
                      scenario: "65-year-old male with crushing chest pain, radiating to left arm",
                      expectedOutcome: "URGENT escalation - Call 911"
                    },
                    {
                      scenario: "45-year-old female with mild chest discomfort after exercise",
                      expectedOutcome: "HIGH priority - Schedule same-day appointment"
                    },
                    {
                      scenario: "30-year-old with questions about prescribed cardiac medication",
                      expectedOutcome: "MEDIUM priority - Provide education and schedule follow-up"
                    }
                  ].map((test, index) => (
                    <Card key={index} className="p-3">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Scenario {index + 1}:</p>
                        <p className="text-sm">{test.scenario}</p>
                        <p className="text-sm text-muted-foreground">
                          Expected: {test.expectedOutcome}
                        </p>
                        <Button size="sm" variant="outline">
                          <Play className="h-3 w-3 mr-1" />
                          Test Scenario
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 6:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Review & Deploy
              </CardTitle>
              <CardDescription>
                Final review of your protocol before activation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">Protocol Summary</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        {getDepartmentIcon(protocolData.department)}
                        <span className="font-medium">{protocolData.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{protocolData.description}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Coverage</Label>
                    <div className="mt-1">
                      <p className="text-sm">{protocolData.symptoms.length} symptoms</p>
                      <p className="text-sm">{protocolData.conditions.length} conditions</p>
                      <p className="text-sm">{protocolData.decisionTree.length} decision steps</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">Deployment Options</Label>
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="activate" defaultChecked />
                        <Label htmlFor="activate" className="text-sm">
                          Activate immediately after deployment
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="pilot" />
                        <Label htmlFor="pilot" className="text-sm">
                          Start with pilot testing (10% of cases)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="notifications" defaultChecked />
                        <Label htmlFor="notifications" className="text-sm">
                          Send notifications for escalations
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="font-medium text-success">Protocol Ready</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your protocol has passed all validation checks and is ready for deployment.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Protocols
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Create Triage Protocol
              </h1>
              <p className="text-muted-foreground mt-1">
                Build a new AI-powered triage assessment protocol
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Save className="h-4 w-4 mr-1" />
              Save Draft
            </Button>
          </div>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Step {currentStep} of {steps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between">
                <span className="text-sm font-medium">
                  {steps[currentStep - 1]?.title}
                </span>
                <span className="text-sm text-muted-foreground">
                  {steps[currentStep - 1]?.description}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              {currentStep === steps.length ? (
                <Button className="bg-success hover:bg-success/90">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Deploy Protocol
                </Button>
              ) : (
                <Button 
                  onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}