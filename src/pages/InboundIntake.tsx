import { useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  UserPlus, 
  Search, 
  Settings, 
  Bot,
  Clock,
  CheckCircle,
  Phone,
  Users,
  TrendingUp,
  AlertTriangle,
  PhoneCall,
  Clipboard,
  FileText,
  Calendar,
  Activity
} from "lucide-react"

// Mock data for patient intake
const mockIntakeData = [
  {
    id: "intake-1",
    patientName: "Jennifer Adams",
    phoneNumber: "+1 (555) 456-7890",
    reason: "New patient - Primary care registration",
    stage: "insurance_verification",
    completionPercentage: 60,
    aiAssistantActive: true,
    urgency: "routine",
    status: "in_progress",
    estimatedTime: "8 mins remaining",
    department: "General Medicine",
    insuranceProvider: "Blue Cross Blue Shield",
    lastActivity: "Collecting emergency contact information"
  },
  {
    id: "intake-2", 
    patientName: "Carlos Rodriguez",
    phoneNumber: "+1 (555) 567-8901",
    reason: "Specialist referral intake - Cardiology",
    stage: "medical_history",
    completionPercentage: 35,
    aiAssistantActive: true,
    urgency: "urgent",
    status: "in_progress", 
    estimatedTime: "12 mins remaining",
    department: "Cardiology",
    insuranceProvider: "Aetna",
    lastActivity: "Reviewing cardiac symptoms and history"
  },
  {
    id: "intake-3",
    patientName: "Susan Kim",
    phoneNumber: "+1 (555) 678-9012",
    reason: "Annual wellness visit registration",
    stage: "completed",
    completionPercentage: 100,
    aiAssistantActive: false,
    urgency: "routine",
    status: "completed",
    estimatedTime: "Completed",
    department: "Preventive Care",
    insuranceProvider: "UnitedHealth", 
    lastActivity: "Intake completed successfully"
  },
  {
    id: "intake-4",
    patientName: "Thomas Wilson",
    phoneNumber: "+1 (555) 789-0123",
    reason: "Emergency department pre-registration",
    stage: "basic_information",
    completionPercentage: 15,
    aiAssistantActive: true,
    urgency: "urgent",
    status: "queued",
    estimatedTime: "Waiting for patient",
    department: "Emergency Medicine",
    insuranceProvider: "Medicare",
    lastActivity: "Initial contact attempted"
  }
]

const intakeStages = [
  { id: "basic_information", name: "Basic Information", order: 1 },
  { id: "insurance_verification", name: "Insurance Verification", order: 2 },
  { id: "medical_history", name: "Medical History", order: 3 },
  { id: "emergency_contacts", name: "Emergency Contacts", order: 4 },
  { id: "completed", name: "Completed", order: 5 }
]

export default function InboundIntake() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedUrgency, setSelectedUrgency] = useState("all")

  const filteredIntakes = mockIntakeData.filter(intake => {
    const matchesSearch = intake.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         intake.reason.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || intake.status === selectedStatus
    const matchesUrgency = selectedUrgency === "all" || intake.urgency === selectedUrgency
    return matchesSearch && matchesStatus && matchesUrgency
  })

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent": return "destructive"
      case "routine": return "secondary"
      default: return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_progress": return <Activity className="h-4 w-4 text-primary" />
      case "completed": return <CheckCircle className="h-4 w-4 text-success" />
      case "queued": return <Clock className="h-4 w-4 text-warning" />
      default: return <UserPlus className="h-4 w-4" />
    }
  }

  const getStageProgress = (stage: string) => {
    const stageData = intakeStages.find(s => s.id === stage)
    return stageData ? (stageData.order / intakeStages.length) * 100 : 0
  }

  const activeIntakesCount = mockIntakeData.filter(i => i.status === "in_progress").length
  const queuedIntakesCount = mockIntakeData.filter(i => i.status === "queued").length
  const completedTodayCount = mockIntakeData.filter(i => i.status === "completed").length
  const aiActiveCount = mockIntakeData.filter(i => i.aiAssistantActive).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Inbound Patient Intake
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered patient registration and information collection
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-1" />
              Intake Settings
            </Button>
            <Button>
              <PhoneCall className="h-4 w-4 mr-1" />
              Start Intake
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Active Intakes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{activeIntakesCount}</div>
              <p className="text-xs text-muted-foreground">In progress now</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                In Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{queuedIntakesCount}</div>
              <p className="text-xs text-muted-foreground">Waiting to start</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Completed Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{completedTodayCount}</div>
              <p className="text-xs text-muted-foreground">Successfully registered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="h-4 w-4 text-info" />
                AI Assisted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">{aiActiveCount}</div>
              <p className="text-xs text-muted-foreground">Using AI assistance</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI Intake Performance
            </CardTitle>
            <CardDescription>Real-time metrics for automated patient intake</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Completion Rate</span>
                  <span className="font-medium">89%</span>
                </div>
                <Progress value={89} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Average Time</span>
                  <span className="font-medium">12.4 min</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Data Accuracy</span>
                  <span className="font-medium">96%</span>
                </div>
                <Progress value={96} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Patient Satisfaction</span>
                  <span className="font-medium">4.7/5</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients or intake reasons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedStatus === "all" ? "default" : "outline"}
              onClick={() => setSelectedStatus("all")}
              size="sm"
            >
              All Status
            </Button>
            <Button
              variant={selectedStatus === "in_progress" ? "default" : "outline"}
              onClick={() => setSelectedStatus("in_progress")}
              size="sm"
            >
              <Activity className="h-4 w-4 mr-1" />
              Active
            </Button>
            <Button
              variant={selectedStatus === "queued" ? "default" : "outline"}
              onClick={() => setSelectedStatus("queued")}
              size="sm"
            >
              <Clock className="h-4 w-4 mr-1" />
              Queued
            </Button>
            <Button
              variant={selectedUrgency === "all" ? "default" : "outline"}
              onClick={() => setSelectedUrgency("all")}
              size="sm"
            >
              All Priority
            </Button>
            <Button
              variant={selectedUrgency === "urgent" ? "default" : "outline"}
              onClick={() => setSelectedUrgency("urgent")}
              size="sm"
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Urgent
            </Button>
          </div>
        </div>

        {/* Intake Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Intake Queue ({filteredIntakes.length})</CardTitle>
            <CardDescription>Current patient registration and intake processes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredIntakes.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No intakes in progress</h3>
                  <p className="text-muted-foreground">All patient intakes are up to date!</p>
                </div>
              ) : (
                filteredIntakes.map((intake) => (
                  <Card key={intake.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex flex-col items-center">
                            {getStatusIcon(intake.status)}
                            <Badge variant={getUrgencyColor(intake.urgency)} className="mt-2 text-xs">
                              {intake.urgency.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h4 className="font-semibold text-lg">{intake.patientName}</h4>
                              {intake.aiAssistantActive && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Bot className="h-3 w-3" />
                                  AI Active
                                </Badge>
                              )}
                              <Badge variant="outline">{intake.department}</Badge>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              <p className="text-sm"><strong>Phone:</strong> {intake.phoneNumber}</p>
                              <p className="text-sm"><strong>Reason:</strong> {intake.reason}</p>
                              <p className="text-sm"><strong>Insurance:</strong> {intake.insuranceProvider}</p>
                              <p className="text-sm text-muted-foreground">
                                <strong>Last Activity:</strong> {intake.lastActivity}
                              </p>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress: {intake.completionPercentage}%</span>
                                <span className="text-muted-foreground">{intake.estimatedTime}</span>
                              </div>
                              <Progress value={intake.completionPercentage} className="h-2" />
                              <p className="text-xs text-muted-foreground">
                                Current Stage: {intakeStages.find(s => s.id === intake.stage)?.name || intake.stage}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {intake.status === "in_progress" ? (
                            <Button variant="default">
                              <Clipboard className="h-4 w-4 mr-1" />
                              Monitor Intake
                            </Button>
                          ) : intake.status === "queued" ? (
                            <Button variant="default">
                              <Phone className="h-4 w-4 mr-1" />
                              Start Intake
                            </Button>
                          ) : (
                            <Button variant="outline">
                              <FileText className="h-4 w-4 mr-1" />
                              View Record
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}