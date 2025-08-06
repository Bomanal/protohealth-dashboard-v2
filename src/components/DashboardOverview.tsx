import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/StatusBadge"
import { mockPatientInteractions, mockOutboundFlows } from "@/data/mockData"
import { 
  Bot, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Heart,
  Stethoscope,
  ArrowRight,
  Link,
  BarChart3
} from "lucide-react"

export function DashboardOverview() {
  const totalInteractions = mockPatientInteractions.length
  const needsActionCount = mockPatientInteractions.filter(i => i.status === "needs_action").length
  const completedToday = mockPatientInteractions.filter(i => i.status === "engaged").length
  const inQueue = mockPatientInteractions.filter(i => i.status === "in_queue").length

  const cardiologyInteractions = mockPatientInteractions.filter(i => i.department === "cardiology")
  const gastroInteractions = mockPatientInteractions.filter(i => i.department === "gastroenterology")

  const recentInteractions = mockPatientInteractions
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground text-lg">Monitor AI agent activity and patient interactions</p>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 border-primary/20 bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-primary font-medium">4 Active Agents</span>
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:bg-card transition-colors shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Interactions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInteractions}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:bg-card transition-colors shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Needs Action</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{needsActionCount}</div>
            <p className="text-xs text-muted-foreground">Requires follow-up</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:bg-card transition-colors shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{completedToday}</div>
            <p className="text-xs text-muted-foreground">Successfully engaged</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:bg-card transition-colors shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">In Queue</CardTitle>
            <Clock className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{inQueue}</div>
            <p className="text-xs text-muted-foreground">Awaiting contact</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Overview */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cardiology">
            <Heart className="h-4 w-4 mr-1" />
            Cardiology
          </TabsTrigger>
          <TabsTrigger value="gastroenterology">
            <Stethoscope className="h-4 w-4 mr-1" />
            Gastroenterology
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Interactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Interactions</CardTitle>
                <CardDescription>Latest patient interactions across all departments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentInteractions.map((interaction) => (
                  <div key={interaction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{interaction.patientName}</p>
                        <Badge variant="outline" className="text-xs">
                          {interaction.department}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{interaction.sourceDetail || interaction.source}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={interaction.status} />
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Active Outbound Flows */}
            <Card>
              <CardHeader>
                <CardTitle>Active Outbound Flows</CardTitle>
                <CardDescription>Currently running AI communication flows</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockOutboundFlows.map((flow) => (
                  <div key={flow.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{flow.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {flow.department}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{flow.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {flow.completedCount}/{flow.patientCount} completed
                      </span>
                      {flow.needsActionCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {flow.needsActionCount} need action
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cardiology" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cardiologyInteractions.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Needs Action</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {cardiologyInteractions.filter(i => i.status === "needs_action").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Engaged Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {cardiologyInteractions.filter(i => i.status === "engaged").length}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gastroenterology" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gastroInteractions.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Needs Action</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {gastroInteractions.filter(i => i.status === "needs_action").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Engaged Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {gastroInteractions.filter(i => i.status === "engaged").length}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Visualize Protocol Link */}
      <Link to="/visualize-protocol" className="block">
        <div className="border rounded-lg p-6 shadow hover:shadow-lg transition bg-white flex items-center gap-4">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <div className="font-semibold text-lg">Visualize Protocol</div>
            <div className="text-sm text-muted-foreground">Explore and edit protocol data matrix</div>
          </div>
        </div>
      </Link>
    </div>
  )
}