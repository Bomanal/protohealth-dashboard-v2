import { useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft, 
  Wand2, 
  Users, 
  MessageSquare, 
  Phone, 
  Mail,
  Heart,
  Stethoscope,
  Sparkles
} from "lucide-react"

export default function CreateOutboundFlow() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "",
    objective: "",
    patientQuery: ""
  })

  const [step, setStep] = useState(1)
  const [interpretedQuery, setInterpretedQuery] = useState("")
  const [generatedContent, setGeneratedContent] = useState({
    textMessage: "",
    callScript: "",
    email: ""
  })

  const handlePatientQuerySubmit = () => {
    // Mock AI interpretation of the patient selection query
    const mockInterpretation = `SELECT * FROM patients WHERE 
    department = '${formData.department}' 
    AND next_appointment_date BETWEEN CURRENT_DATE + 7 AND CURRENT_DATE + 14
    AND procedure_type = 'cardiac_catheterization'
    AND contact_preference IS NOT NULL`
    
    setInterpretedQuery(mockInterpretation)
    setStep(2)
  }

  const handleContentGeneration = () => {
    // Mock AI content generation based on objective
    const mockContent = {
      textMessage: `Hi ${formData.department === "cardiology" ? "[Patient Name]" : "[Patient Name]"}, this is ProtoHealth AI. We're reaching out about your upcoming appointment. Please reply if you have any questions about your ${formData.department === "cardiology" ? "cardiac" : "gastroenterology"} procedure.`,
      callScript: `Hello, this is the ProtoHealth AI assistant calling about your upcoming ${formData.department} appointment. I wanted to check if you have any questions about your procedure and ensure you're prepared. 

Key points to cover:
- Confirm appointment date and time
- Review pre-procedure instructions
- Address any patient concerns
- Provide contact information for urgent questions`,
      email: `Subject: Your Upcoming ${formData.department === "cardiology" ? "Cardiac" : "Gastroenterology"} Appointment

Dear [Patient Name],

We hope this message finds you well. We're reaching out to ensure you're prepared for your upcoming appointment.

${formData.objective}

If you have any questions or concerns, please don't hesitate to contact our team.

Best regards,
ProtoHealth AI Assistant`
    }
    
    setGeneratedContent(mockContent)
    setStep(3)
  }

  const handleCreateFlow = () => {
    toast({
      title: "Outbound Flow Created",
      description: `"${formData.name}" has been created successfully and is now active.`,
    })
    navigate("/outbound-agents")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate("/outbound-agents")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Create Outbound Flow
            </h1>
            <p className="text-muted-foreground">Set up a new AI-driven patient communication flow</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 py-4">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNum 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {stepNum}
              </div>
              {stepNum < 4 && (
                <div className={`w-12 h-0.5 ${
                  step > stepNum ? "bg-primary" : "bg-muted"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Flow Information
              </CardTitle>
              <CardDescription>
                Provide basic details about your outbound communication flow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Flow Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Post-Surgery Follow-up"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiology">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          Cardiology
                        </div>
                      </SelectItem>
                      <SelectItem value="gastroenterology">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4" />
                          Gastroenterology
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose and scope of this communication flow..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Communication Objective</Label>
                <Textarea
                  id="objective"
                  placeholder="What do you want to accomplish and educate the patient about?"
                  value={formData.objective}
                  onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                  rows={4}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="patientQuery">Patient Selection Query</Label>
                <Textarea
                  id="patientQuery"
                  placeholder="e.g., everyone who has an upcoming surgery in 1 week"
                  value={formData.patientQuery}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientQuery: e.target.value }))}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  Describe which patients should be included using natural language
                </p>
              </div>

              <Button 
                onClick={handlePatientQuerySubmit}
                disabled={!formData.name || !formData.department || !formData.patientQuery}
                className="w-full"
              >
                <Users className="h-4 w-4 mr-2" />
                Interpret Patient Selection
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Query Interpretation */}
        {step === 2 && (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Patient Selection Interpretation
              </CardTitle>
              <CardDescription>
                Review how AI interpreted your patient selection criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Your Query:</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-sm">{formData.patientQuery}</p>
                </div>
              </div>

              <div>
                <Label>AI Interpretation (SQL Query):</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg font-mono text-sm">
                  <pre className="whitespace-pre-wrap">{interpretedQuery}</pre>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline">Estimated: ~12 patients</Badge>
                <Badge variant="outline">Last updated: 2 hours ago</Badge>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(1)} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleContentGeneration} className="flex-1">
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Content
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Generated Content Review */}
        {step === 3 && (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Generated Communication Content
              </CardTitle>
              <CardDescription>
                Review and edit the AI-generated content for different communication channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Text Message */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Text Message
                </Label>
                <Textarea
                  value={generatedContent.textMessage}
                  onChange={(e) => setGeneratedContent(prev => ({ ...prev, textMessage: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Call Script */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Call Script
                </Label>
                <Textarea
                  value={generatedContent.callScript}
                  onChange={(e) => setGeneratedContent(prev => ({ ...prev, callScript: e.target.value }))}
                  rows={6}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Template
                </Label>
                <Textarea
                  value={generatedContent.email}
                  onChange={(e) => setGeneratedContent(prev => ({ ...prev, email: e.target.value }))}
                  rows={8}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(2)} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1">
                  Continue to Final Review
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Final Review */}
        {step === 4 && (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Final Review & Confirmation</CardTitle>
              <CardDescription>
                Review your outbound flow configuration before creating
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Flow Name</Label>
                  <p className="text-sm bg-muted p-2 rounded mt-1">{formData.name}</p>
                </div>
                <div>
                  <Label>Department</Label>
                  <p className="text-sm bg-muted p-2 rounded mt-1 capitalize">{formData.department}</p>
                </div>
              </div>

              <div>
                <Label>Target Patients</Label>
                <p className="text-sm bg-muted p-2 rounded mt-1">~12 patients matching your criteria</p>
              </div>

              <div>
                <Label>Communication Channels</Label>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline">Text Messages</Badge>
                  <Badge variant="outline">Phone Calls</Badge>
                  <Badge variant="outline">Email</Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(3)} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleCreateFlow} className="flex-1 bg-gradient-primary hover:opacity-90">
                  Create Outbound Flow
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}