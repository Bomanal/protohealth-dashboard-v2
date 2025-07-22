import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/StatusBadge"
import { mockOutboundFlows, mockPatientInteractions } from "@/data/mockData"
import { 
  ArrowLeft, 
  Edit, 
  Play, 
  Pause, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  Heart,
  Stethoscope,
  ExternalLink
} from "lucide-react"

export default function OutboundFlowDetails() {
  const { flowId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")

  // Find the flow (in real app, this would be an API call)
  const flow = mockOutboundFlows.find(f => f.id === flowId)
  
  // Get patients for this flow (mock data)
  const flowPatients = mockPatientInteractions.filter(
    p => p.source === "outbound_flow" && p.department === flow?.department
  )

  if (!flow) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Flow not found</p>
        </div>
      </DashboardLayout>
    )
  }

  const DepartmentIcon = flow.department === "cardiology" ? Heart : Stethoscope
  const completionRate = Math.round((flow.completedCount / flow.patientCount) * 100)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success text-success-foreground"
      case "draft":
        return "bg-warning text-warning-foreground"
      case "completed":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate("/outbound-agents")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <DepartmentIcon className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold">{flow.name}</h1>
                <Badge className={`${getStatusColor(flow.status)}`}>
                  {flow.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">{flow.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Flow
            </Button>
            <Button>
              <Play className="h-4 w-4 mr-2" />
              Start Flow
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{flow.patientCount}</div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{flow.completedCount}</div>
              <p className="text-xs text-muted-foreground">{completionRate}% completion rate</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Need Action</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{flow.needsActionCount}</div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Created</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{flow.createdDate.toLocaleDateString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Flow Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Completion</span>
                <span className="font-medium">{completionRate}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div 
                  className="bg-gradient-primary h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{flow.completedCount} completed</span>
                <span>{flow.patientCount - flow.completedCount} remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patient List ({flowPatients.length})</TabsTrigger>
            <TabsTrigger value="content">Communication Content</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Flow Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Department</label>
                    <p className="text-sm text-muted-foreground capitalize">{flow.department}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Communication Channels</label>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        Text
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Call
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Target Criteria</label>
                    <p className="text-sm text-muted-foreground">
                      Patients with upcoming procedures in the next 7-14 days
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {flowPatients.slice(0, 5).map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <p className="font-medium text-sm">{patient.patientName}</p>
                          <p className="text-xs text-muted-foreground">
                            {patient.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <StatusBadge status={patient.status} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patients" className="space-y-4">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Patient Interactions</CardTitle>
                <CardDescription>
                  All patients included in this outbound flow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Contact</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flowPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{patient.patientName}</p>
                            <p className="text-sm text-muted-foreground">{patient.patientId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={patient.status} />
                        </TableCell>
                        <TableCell>
                          {patient.lastContact?.toLocaleDateString() || "Never"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            patient.priority === "high" ? "destructive" :
                            patient.priority === "medium" ? "default" : "secondary"
                          }>
                            {patient.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Text Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded text-sm">
                    Hi [Patient Name], this is ProtoHealth AI. We're reaching out about your upcoming cardiac procedure. Please reply if you have any questions.
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Call Script
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded text-sm">
                    <p>Hello, this is the ProtoHealth AI assistant calling about your upcoming procedure...</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Template
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded text-sm">
                    <p><strong>Subject:</strong> Your Upcoming Cardiac Appointment</p>
                    <p className="mt-2">Dear [Patient Name], We hope this message finds you well...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Response Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Text Messages</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phone Calls</span>
                      <span className="font-medium">72%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Emails</span>
                      <span className="font-medium">45%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Engagement Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Engagement analytics and timeline visualization would go here
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}