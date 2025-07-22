import { useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { 
  Calendar as CalendarIcon, 
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
  UserPlus
} from "lucide-react"

// Mock data for inbound scheduling
const mockSchedulingData = [
  {
    id: "sched-1",
    patientName: "David Kim",
    phoneNumber: "+1 (555) 789-0123",
    requestType: "New appointment - Cardiology consultation",
    preferredDate: "Next week",
    urgency: "routine",
    status: "in_progress",
    aiAssistantActive: true,
    waitTime: "3 mins",
    appointmentType: "consultation"
  },
  {
    id: "sched-2", 
    patientName: "Lisa Thompson",
    phoneNumber: "+1 (555) 890-1234",
    requestType: "Reschedule existing gastroenterology follow-up",
    preferredDate: "This Friday morning",
    urgency: "urgent",
    status: "completed",
    aiAssistantActive: true,
    waitTime: "7 mins",
    appointmentType: "follow-up"
  },
  {
    id: "sched-3",
    patientName: "Robert Martinez",
    phoneNumber: "+1 (555) 901-2345", 
    requestType: "Cancel and reschedule procedure",
    preferredDate: "Flexible",
    urgency: "medium",
    status: "queued",
    aiAssistantActive: false,
    waitTime: "12 mins",
    appointmentType: "procedure"
  }
]

export default function InboundScheduling() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const filteredCalls = mockSchedulingData.filter(call => {
    const matchesSearch = call.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         call.requestType.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || call.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent": return "destructive"
      case "medium": return "secondary" 
      case "routine": return "outline"
      default: return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_progress": return <Phone className="h-4 w-4 text-primary" />
      case "completed": return <CheckCircle className="h-4 w-4 text-success" />
      case "queued": return <Clock className="h-4 w-4 text-warning" />
      default: return <CalendarIcon className="h-4 w-4" />
    }
  }

  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case "consultation": return <Users className="h-4 w-4" />
      case "follow-up": return <TrendingUp className="h-4 w-4" />
      case "procedure": return <UserPlus className="h-4 w-4" />
      default: return <CalendarIcon className="h-4 w-4" />
    }
  }

  const activeCallsCount = mockSchedulingData.filter(c => c.status === "in_progress").length
  const queuedCallsCount = mockSchedulingData.filter(c => c.status === "queued").length
  const completedTodayCount = mockSchedulingData.filter(c => c.status === "completed").length
  const aiActiveCount = mockSchedulingData.filter(c => c.aiAssistantActive).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Inbound Scheduling
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered appointment scheduling and calendar management
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-1" />
              Schedule Settings
            </Button>
            <Button>
              <PhoneCall className="h-4 w-4 mr-1" />
              Take Calls
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
              <p className="text-xs text-muted-foreground">Scheduling now</p>
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
              <p className="text-xs text-muted-foreground">Waiting for help</p>
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
              <p className="text-xs text-muted-foreground">Successfully scheduled</p>
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
              <p className="text-xs text-muted-foreground">Using AI scheduling</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scheduling Queue */}
          <div className="lg:col-span-2 space-y-4">
            {/* AI Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  AI Scheduling Performance
                </CardTitle>
                <CardDescription>Real-time metrics for automated scheduling</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Success Rate</span>
                      <span className="font-medium">91%</span>
                    </div>
                    <Progress value={91} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Avg Call Time</span>
                      <span className="font-medium">4.8 min</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>First Call Resolution</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients or appointment requests..."
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
              </div>
            </div>

            {/* Scheduling Queue List */}
            <Card>
              <CardHeader>
                <CardTitle>Scheduling Queue ({filteredCalls.length})</CardTitle>
                <CardDescription>Current appointment scheduling requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCalls.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No scheduling requests</h3>
                      <p className="text-muted-foreground">All scheduling requests are handled!</p>
                    </div>
                  ) : (
                    filteredCalls.map((call) => (
                      <Card key={call.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="flex flex-col items-center">
                                {getStatusIcon(call.status)}
                                <Badge variant={getUrgencyColor(call.urgency)} className="mt-1 text-xs">
                                  {call.urgency.toUpperCase()}
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
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    {getAppointmentIcon(call.appointmentType)}
                                    {call.appointmentType}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-1">
                                  <p className="text-sm"><strong>Phone:</strong> {call.phoneNumber}</p>
                                  <p className="text-sm"><strong>Request:</strong> {call.requestType}</p>
                                  <p className="text-sm"><strong>Preferred:</strong> {call.preferredDate}</p>
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Wait Time:</strong> {call.waitTime}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              {call.status === "in_progress" ? (
                                <Button variant="default">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  Assist Schedule
                                </Button>
                              ) : call.status === "queued" ? (
                                <Button variant="default">
                                  <Phone className="h-4 w-4 mr-1" />
                                  Take Call
                                </Button>
                              ) : (
                                <Button variant="outline">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  View Appointment
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

          {/* Calendar Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Calendar View
                </CardTitle>
                <CardDescription>Available appointment slots</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Appointments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div>
                    <p className="text-sm font-medium">9:00 AM</p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                  <Badge variant="secondary">Open</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div>
                    <p className="text-sm font-medium">10:30 AM</p>
                    <p className="text-xs text-muted-foreground">Dr. Johnson</p>
                  </div>
                  <Badge variant="destructive">Booked</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div>
                    <p className="text-sm font-medium">2:00 PM</p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                  <Badge variant="secondary">Open</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}