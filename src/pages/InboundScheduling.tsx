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

// Mock data for scheduling protocols
const mockSchedulingProtocols = [
  {
    id: "sched-proto-1",
    name: "Standard Appointment Scheduling",
    description: "Default protocol for routine appointment scheduling",
    appointmentTypes: ["consultation", "follow-up", "procedure"],
    departments: ["General Medicine", "Cardiology", "Gastroenterology"],
    avgCallTime: "4.8 min",
    successRate: 91,
    status: "active",
    createdDate: "2024-01-15",
    lastModified: "2024-01-20",
    dailyUsage: 45,
    totalAppointments: 1247
  },
  {
    id: "sched-proto-2", 
    name: "Emergency Scheduling Protocol",
    description: "Expedited scheduling for urgent appointments",
    appointmentTypes: ["emergency", "urgent consultation"],
    departments: ["Emergency Medicine", "Cardiology", "Neurology"],
    avgCallTime: "3.2 min",
    successRate: 95,
    status: "active",
    createdDate: "2024-01-10",
    lastModified: "2024-01-22",
    dailyUsage: 12,
    totalAppointments: 324
  },
  {
    id: "sched-proto-3",
    name: "Specialist Referral Scheduling",
    description: "Protocol for scheduling specialist appointments from referrals",
    appointmentTypes: ["specialist consultation", "referral follow-up"],
    departments: ["Cardiology", "Orthopedics", "Dermatology"],
    avgCallTime: "6.1 min",
    successRate: 87,
    status: "active",
    createdDate: "2024-01-08",
    lastModified: "2024-01-18",
    dailyUsage: 28,
    totalAppointments: 892
  }
]

export default function InboundScheduling() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const filteredProtocols = mockSchedulingProtocols.filter(protocol => {
    const matchesSearch = protocol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         protocol.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || protocol.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return "text-success"
    if (rate >= 80) return "text-warning"
    return "text-destructive"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-success" />
      case "inactive": return <Clock className="h-4 w-4 text-muted-foreground" />
      case "draft": return <Settings className="h-4 w-4 text-warning" />
      default: return <CalendarIcon className="h-4 w-4" />
    }
  }

  const activeProtocolsCount = mockSchedulingProtocols.filter(p => p.status === "active").length
  const totalAppointments = mockSchedulingProtocols.reduce((sum, p) => sum + p.dailyUsage, 0)
  const avgSuccessRate = Math.round(mockSchedulingProtocols.reduce((sum, p) => sum + p.successRate, 0) / mockSchedulingProtocols.length)
  const avgCallTime = (mockSchedulingProtocols.reduce((sum, p) => sum + parseFloat(p.avgCallTime), 0) / mockSchedulingProtocols.length).toFixed(1)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Scheduling Protocols
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage AI-powered appointment scheduling protocols and automation
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-1" />
              Protocol Settings
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-1" />
              Create Protocol
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Active Protocols
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{activeProtocolsCount}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-primary" />
                Daily Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalAppointments}</div>
              <p className="text-xs text-muted-foreground">Scheduled today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-info" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">{avgSuccessRate}%</div>
              <p className="text-xs text-muted-foreground">Average across protocols</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                Avg Call Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{avgCallTime} min</div>
              <p className="text-xs text-muted-foreground">Per appointment</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scheduling Protocols */}
          <div className="lg:col-span-2 space-y-4">
            {/* AI Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Protocol Performance Overview
                </CardTitle>
                <CardDescription>Real-time metrics across all scheduling protocols</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Success Rate</span>
                      <span className="font-medium">{avgSuccessRate}%</span>
                    </div>
                    <Progress value={avgSuccessRate} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Avg Call Time</span>
                      <span className="font-medium">{avgCallTime} min</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Active Protocols</span>
                      <span className="font-medium">{activeProtocolsCount}</span>
                    </div>
                    <Progress value={(activeProtocolsCount / mockSchedulingProtocols.length) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Daily Appointments</span>
                      <span className="font-medium">{totalAppointments}</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search protocols by name or description..."
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
                  All Protocols
                </Button>
                <Button
                  variant={selectedStatus === "active" ? "default" : "outline"}
                  onClick={() => setSelectedStatus("active")}
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Active
                </Button>
                <Button
                  variant={selectedStatus === "draft" ? "default" : "outline"}
                  onClick={() => setSelectedStatus("draft")}
                  size="sm"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Draft
                </Button>
              </div>
            </div>

            {/* Scheduling Protocols List */}
            <Card>
              <CardHeader>
                <CardTitle>Scheduling Protocols ({filteredProtocols.length})</CardTitle>
                <CardDescription>Manage AI-powered appointment scheduling protocols</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProtocols.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No protocols found</h3>
                      <p className="text-muted-foreground">Create a new scheduling protocol to get started!</p>
                    </div>
                  ) : (
                    filteredProtocols.map((protocol) => (
                      <Card key={protocol.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="flex flex-col items-center">
                                {getStatusIcon(protocol.status)}
                                <Badge 
                                  variant={protocol.status === "active" ? "default" : "secondary"} 
                                  className="mt-2 text-xs"
                                >
                                  {protocol.status.toUpperCase()}
                                </Badge>
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h4 className="font-semibold text-lg">{protocol.name}</h4>
                                  <Badge variant="outline">{protocol.appointmentTypes.length} Types</Badge>
                                  <Badge variant="outline">{protocol.departments.length} Departments</Badge>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-4">{protocol.description}</p>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="font-medium">Success Rate</p>
                                    <p className={`text-lg font-bold ${getSuccessRateColor(protocol.successRate)}`}>
                                      {protocol.successRate}%
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Avg Call Time</p>
                                    <p className="text-lg font-bold text-primary">{protocol.avgCallTime}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Daily Usage</p>
                                    <p className="text-lg font-bold text-info">{protocol.dailyUsage}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Total Scheduled</p>
                                    <p className="text-lg font-bold text-success">{protocol.totalAppointments}</p>
                                  </div>
                                </div>
                                
                                <div className="mt-4 text-xs text-muted-foreground">
                                  Created: {protocol.createdDate} • Last modified: {protocol.lastModified}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                              <Button variant="default">
                                <Settings className="h-4 w-4 mr-1" />
                                Edit Protocol
                              </Button>
                              <Button variant="outline" size="sm">
                                Copy Protocol
                              </Button>
                              <Button variant="ghost" size="sm">
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