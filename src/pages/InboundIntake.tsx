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

// Mock data for intake protocols
const mockIntakeProtocols = [
  {
    id: "intake-proto-1",
    name: "Standard Patient Intake",
    description: "Complete intake process for new patients including insurance verification and medical history",
    stages: ["basic_information", "insurance_verification", "medical_history", "emergency_contacts"],
    departments: ["General Medicine", "Family Practice", "Preventive Care"],
    avgTime: "12.4 min",
    completionRate: 89,
    dataAccuracy: 96,
    status: "active",
    createdDate: "2024-01-12",
    lastModified: "2024-01-19",
    dailyUsage: 38,
    totalIntakes: 1456
  },
  {
    id: "intake-proto-2", 
    name: "Express Intake Protocol",
    description: "Streamlined intake for returning patients and follow-up appointments",
    stages: ["basic_information", "insurance_verification"],
    departments: ["General Medicine", "Cardiology", "Gastroenterology"],
    avgTime: "6.8 min",
    completionRate: 94,
    dataAccuracy: 92,
    status: "active",
    createdDate: "2024-01-08",
    lastModified: "2024-01-20",
    dailyUsage: 25,
    totalIntakes: 892
  },
  {
    id: "intake-proto-3",
    name: "Emergency Intake Protocol",
    description: "Rapid intake process for emergency department patients focusing on essential information",
    stages: ["basic_information", "emergency_contacts", "insurance_verification"],
    departments: ["Emergency Medicine", "Urgent Care"],
    avgTime: "4.2 min",
    completionRate: 87,
    dataAccuracy: 89,
    status: "active",
    createdDate: "2024-01-05",
    lastModified: "2024-01-18",
    dailyUsage: 15,
    totalIntakes: 534
  }
]

export default function InboundIntake() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const filteredProtocols = mockIntakeProtocols.filter(protocol => {
    const matchesSearch = protocol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         protocol.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || protocol.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 90) return "text-success"
    if (rate >= 80) return "text-warning"
    return "text-destructive"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-success" />
      case "inactive": return <Clock className="h-4 w-4 text-muted-foreground" />
      case "draft": return <Settings className="h-4 w-4 text-warning" />
      default: return <UserPlus className="h-4 w-4" />
    }
  }

  const activeProtocolsCount = mockIntakeProtocols.filter(p => p.status === "active").length
  const totalIntakes = mockIntakeProtocols.reduce((sum, p) => sum + p.dailyUsage, 0)
  const avgCompletionRate = Math.round(mockIntakeProtocols.reduce((sum, p) => sum + p.completionRate, 0) / mockIntakeProtocols.length)
  const avgTime = (mockIntakeProtocols.reduce((sum, p) => sum + parseFloat(p.avgTime), 0) / mockIntakeProtocols.length).toFixed(1)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Patient Intake Protocols
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage AI-powered patient registration and intake protocols
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
                <Activity className="h-4 w-4 text-primary" />
                Daily Intakes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalIntakes}</div>
              <p className="text-xs text-muted-foreground">Processed today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-info" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">{avgCompletionRate}%</div>
              <p className="text-xs text-muted-foreground">Average across protocols</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                Avg Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{avgTime} min</div>
              <p className="text-xs text-muted-foreground">Per intake process</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Protocol Performance Overview
            </CardTitle>
            <CardDescription>Real-time metrics across all intake protocols</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Completion Rate</span>
                  <span className="font-medium">{avgCompletionRate}%</span>
                </div>
                <Progress value={avgCompletionRate} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Average Time</span>
                  <span className="font-medium">{avgTime} min</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Active Protocols</span>
                  <span className="font-medium">{activeProtocolsCount}</span>
                </div>
                <Progress value={(activeProtocolsCount / mockIntakeProtocols.length) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Daily Intakes</span>
                  <span className="font-medium">{totalIntakes}</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search protocols by name or description..."
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

        {/* Intake Protocols */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Intake Protocols ({filteredProtocols.length})</CardTitle>
            <CardDescription>Manage AI-powered patient registration and intake protocols</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProtocols.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No protocols found</h3>
                  <p className="text-muted-foreground">Create a new intake protocol to get started!</p>
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
                              <Badge variant="outline">{protocol.stages.length} Stages</Badge>
                              <Badge variant="outline">{protocol.departments.length} Departments</Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-4">{protocol.description}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="font-medium">Completion Rate</p>
                                <p className={`text-lg font-bold ${getCompletionRateColor(protocol.completionRate)}`}>
                                  {protocol.completionRate}%
                                </p>
                              </div>
                              <div>
                                <p className="font-medium">Avg Time</p>
                                <p className="text-lg font-bold text-primary">{protocol.avgTime}</p>
                              </div>
                              <div>
                                <p className="font-medium">Data Accuracy</p>
                                <p className="text-lg font-bold text-info">{protocol.dataAccuracy}%</p>
                              </div>
                              <div>
                                <p className="font-medium">Daily Usage</p>
                                <p className="text-lg font-bold text-success">{protocol.dailyUsage}</p>
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
    </DashboardLayout>
  )
}