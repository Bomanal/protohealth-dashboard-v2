import { useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  MessageSquare, 
  Search, 
  Settings, 
  Bot,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Phone,
  PhoneCall,
  Users,
  Activity
} from "lucide-react"

// Mock data for inbound triage
const mockTriageData = [
  {
    id: "triage-1",
    patientName: "Sarah Johnson",
    phoneNumber: "+1 (555) 123-4567",
    chiefComplaint: "Chest pain and shortness of breath",
    severity: "high",
    waitTime: "2 mins",
    status: "in_progress",
    aiAssistantActive: true,
    department: "Emergency Assessment"
  },
  {
    id: "triage-2", 
    patientName: "Michael Chen",
    phoneNumber: "+1 (555) 234-5678",
    chiefComplaint: "Follow-up on recent lab results",
    severity: "low",
    waitTime: "8 mins",
    status: "queued",
    aiAssistantActive: false,
    department: "General Consultation"
  },
  {
    id: "triage-3",
    patientName: "Emma Rodriguez",
    phoneNumber: "+1 (555) 345-6789", 
    chiefComplaint: "Medication side effects and concerns",
    severity: "medium",
    waitTime: "5 mins",
    status: "completed",
    aiAssistantActive: true,
    department: "Medication Review"
  }
]

export default function InboundTriage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const filteredCalls = mockTriageData.filter(call => {
    const matchesSearch = call.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         call.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || call.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "destructive"
      case "medium": return "secondary" 
      case "low": return "outline"
      default: return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_progress": return <Phone className="h-4 w-4 text-primary" />
      case "completed": return <CheckCircle className="h-4 w-4 text-success" />
      case "queued": return <Clock className="h-4 w-4 text-warning" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const activeCallsCount = mockTriageData.filter(c => c.status === "in_progress").length
  const queuedCallsCount = mockTriageData.filter(c => c.status === "queued").length
  const completedTodayCount = mockTriageData.filter(c => c.status === "completed").length
  const aiActiveCount = mockTriageData.filter(c => c.aiAssistantActive).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Inbound Nurse Triage
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-assisted phone triage and patient assessment
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-1" />
              Configure AI
            </Button>
            <Button>
              <PhoneCall className="h-4 w-4 mr-1" />
              Start Shift
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Active Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{activeCallsCount}</div>
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
              <div className="text-2xl font-bold text-warning">{queuedCallsCount}</div>
              <p className="text-xs text-muted-foreground">Waiting for triage</p>
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
              <p className="text-xs text-muted-foreground">Successfully triaged</p>
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
              <p className="text-xs text-muted-foreground">Using AI support</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI Assistant Performance
            </CardTitle>
            <CardDescription>Real-time metrics for AI-assisted triage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Accuracy Rate</span>
                  <span className="font-medium">94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Average Call Duration</span>
                  <span className="font-medium">6.2 min</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Patient Satisfaction</span>
                  <span className="font-medium">4.8/5</span>
                </div>
                <Progress value={96} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients or chief complaints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedStatus === "all" ? "default" : "outline"}
              onClick={() => setSelectedStatus("all")}
              size="sm"
            >
              All Calls
            </Button>
            <Button
              variant={selectedStatus === "in_progress" ? "default" : "outline"}
              onClick={() => setSelectedStatus("in_progress")}
              size="sm"
            >
              <Phone className="h-4 w-4 mr-1" />
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
              variant={selectedStatus === "completed" ? "default" : "outline"}
              onClick={() => setSelectedStatus("completed")}
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Completed
            </Button>
          </div>
        </div>

        {/* Triage Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Triage Queue ({filteredCalls.length})</CardTitle>
            <CardDescription>Current inbound calls and triage status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCalls.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No calls in queue</h3>
                  <p className="text-muted-foreground">All caught up! New calls will appear here.</p>
                </div>
              ) : (
                filteredCalls.map((call) => (
                  <Card key={call.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex flex-col items-center">
                            {getStatusIcon(call.status)}
                            <Badge variant={getSeverityColor(call.severity)} className="mt-1 text-xs">
                              {call.severity.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-lg">{call.patientName}</h4>
                              {call.aiAssistantActive && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Bot className="h-3 w-3" />
                                  AI Active
                                </Badge>
                              )}
                              <Badge variant="outline">{call.department}</Badge>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-sm"><strong>Phone:</strong> {call.phoneNumber}</p>
                              <p className="text-sm"><strong>Chief Complaint:</strong> {call.chiefComplaint}</p>
                              <p className="text-sm text-muted-foreground">
                                <strong>Wait Time:</strong> {call.waitTime}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {call.status === "in_progress" ? (
                            <Button variant="default">
                              <Activity className="h-4 w-4 mr-1" />
                              Monitor Call
                            </Button>
                          ) : call.status === "queued" ? (
                            <Button variant="default">
                              <Phone className="h-4 w-4 mr-1" />
                              Answer Call
                            </Button>
                          ) : (
                            <Button variant="outline">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              View Summary
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