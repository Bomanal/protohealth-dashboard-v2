import { useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { mockTriageProtocols } from "@/data/mockData"
import { 
  MessageSquare, 
  Search, 
  Settings, 
  Plus,
  TrendingUp,
  CheckCircle,
  Users,
  Activity,
  Edit,
  Copy,
  Trash2,
  Heart,
  Stethoscope,
  FileText,
  Calendar
} from "lucide-react"

export default function InboundTriage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  const filteredProtocols = mockTriageProtocols.filter(protocol => {
    const matchesSearch = protocol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         protocol.symptoms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesDepartment = selectedDepartment === "all" || protocol.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case "cardiology":
        return <Heart className="h-4 w-4 text-red-500" />
      case "gastroenterology":
        return <Stethoscope className="h-4 w-4 text-blue-500" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    })
  }

  const activeProtocolsCount = mockTriageProtocols.filter(p => p.status === "active").length
  const cardiologyCount = mockTriageProtocols.filter(p => p.department === "cardiology").length
  const gastroCount = mockTriageProtocols.filter(p => p.department === "gastroenterology").length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Inbound Triage Protocols
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage AI triage decision trees and symptom assessments
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-1" />
              Protocol Settings
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Create New Protocol
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
              <p className="text-xs text-muted-foreground">Currently deployed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Cardiology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cardiologyCount}</div>
              <p className="text-xs text-muted-foreground">Protocols available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-blue-500" />
                Gastroenterology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gastroCount}</div>
              <p className="text-xs text-muted-foreground">Protocols available</p>
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
              <div className="text-2xl font-bold text-info">94%</div>
              <p className="text-xs text-muted-foreground">Protocol accuracy</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Protocol Performance
            </CardTitle>
            <CardDescription>AI triage effectiveness across all protocols</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Triage Accuracy</span>
                  <span className="font-medium">94%</span>
                </div>
                <Progress value={94} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Correct initial assessments</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Average Assessment Time</span>
                  <span className="font-medium">3.2 min</span>
                </div>
                <Progress value={88} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Time to complete triage</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Escalation Rate</span>
                  <span className="font-medium">12%</span>
                </div>
                <Progress value={12} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Cases requiring human review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search protocols or symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedDepartment === "all" ? "default" : "outline"}
              onClick={() => setSelectedDepartment("all")}
              size="sm"
            >
              All Departments
            </Button>
            <Button
              variant={selectedDepartment === "cardiology" ? "default" : "outline"}
              onClick={() => setSelectedDepartment("cardiology")}
              size="sm"
            >
              <Heart className="h-4 w-4 mr-1" />
              Cardiology
            </Button>
            <Button
              variant={selectedDepartment === "gastroenterology" ? "default" : "outline"}
              onClick={() => setSelectedDepartment("gastroenterology")}
              size="sm"
            >
              <Stethoscope className="h-4 w-4 mr-1" />
              Gastro
            </Button>
          </div>
        </div>

        {/* Protocols List */}
        <Card>
          <CardHeader>
            <CardTitle>Triage Protocols ({filteredProtocols.length})</CardTitle>
            <CardDescription>Manage your AI triage decision trees and symptom assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProtocols.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No protocols found</h3>
                  <p className="text-muted-foreground mb-4">Create your first triage protocol to get started.</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-1" />
                    Create New Protocol
                  </Button>
                </div>
              ) : (
                filteredProtocols.map((protocol) => (
                  <Card key={protocol.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex flex-col items-center">
                            {getDepartmentIcon(protocol.department)}
                            <Badge variant={protocol.status === "active" ? "default" : "secondary"} className="mt-2 text-xs">
                              {protocol.status.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h4 className="font-semibold text-lg">{protocol.name}</h4>
                              <Badge variant="outline" className="capitalize">
                                {protocol.department}
                              </Badge>
                              <Badge variant="secondary">
                                v{protocol.version}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              <div>
                                <span className="text-sm font-medium">Symptoms Covered: </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {protocol.symptoms.map((symptom, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {symptom}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                <strong>Created by:</strong> {protocol.createdBy}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <strong>Last Updated:</strong> {formatDate(protocol.lastUpdated)}
                              </p>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>248 patients triaged</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4 text-success" />
                                <span>94% accuracy rate</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button size="sm" variant="default">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit Protocol
                          </Button>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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