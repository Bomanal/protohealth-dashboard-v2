import { useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/StatusBadge"
import { mockPatientInteractions } from "@/data/mockData"
import { 
  Eye, 
  Search, 
  Filter, 
  Calendar,
  Download,
  MessageSquare,
  Phone,
  Heart,
  Stethoscope,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react"

export default function AllEngagements() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const filteredInteractions = mockPatientInteractions.filter(interaction => {
    const matchesSearch = interaction.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         interaction.sourceDetail?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || interaction.department === selectedDepartment
    const matchesStatus = selectedStatus === "all" || interaction.status === selectedStatus
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case "cardiology":
        return <Heart className="h-4 w-4" />
      case "gastroenterology":
        return <Stethoscope className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "engaged":
        return <CheckCircle className="h-4 w-4 text-success" />
      case "needs_action":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case "in_queue":
        return <Clock className="h-4 w-4 text-info" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const formatDateTime = (timestamp: Date) => {
    return timestamp.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      hour: "2-digit", 
      minute: "2-digit" 
    })
  }

  const totalEngagements = mockPatientInteractions.length
  const engagedCount = mockPatientInteractions.filter(i => i.status === "engaged").length
  const needsActionCount = mockPatientInteractions.filter(i => i.status === "needs_action").length
  const inQueueCount = mockPatientInteractions.filter(i => i.status === "in_queue").length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              All Engagements
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete overview of patient interactions across all departments
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-1" />
              Date Range
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Total Engagements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEngagements}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Engaged
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{engagedCount}</div>
              <p className="text-xs text-muted-foreground">Successfully contacted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Needs Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{needsActionCount}</div>
              <p className="text-xs text-muted-foreground">Requires follow-up</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-info" />
                In Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">{inQueueCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting contact</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Engagements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients, conditions, or sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
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
              
              <div className="flex gap-2">
                <Button
                  variant={selectedStatus === "all" ? "default" : "outline"}
                  onClick={() => setSelectedStatus("all")}
                  size="sm"
                >
                  All Status
                </Button>
                <Button
                  variant={selectedStatus === "engaged" ? "default" : "outline"}
                  onClick={() => setSelectedStatus("engaged")}
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Engaged
                </Button>
                <Button
                  variant={selectedStatus === "needs_action" ? "default" : "outline"}
                  onClick={() => setSelectedStatus("needs_action")}
                  size="sm"
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Needs Action
                </Button>
                <Button
                  variant={selectedStatus === "in_queue" ? "default" : "outline"}
                  onClick={() => setSelectedStatus("in_queue")}
                  size="sm"
                >
                  <Clock className="h-4 w-4 mr-1" />
                  In Queue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagements Table */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Engagements ({filteredInteractions.length})</CardTitle>
            <CardDescription>
              Showing {filteredInteractions.length} of {totalEngagements} total engagements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredInteractions.length === 0 ? (
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No engagements found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                </div>
              ) : (
                filteredInteractions.map((interaction) => (
                  <Card key={interaction.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            {getDepartmentIcon(interaction.department)}
                            {getStatusIcon(interaction.status)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-semibold">{interaction.patientName}</h4>
                              <Badge variant="outline" className="text-xs">
                                {interaction.department}
                              </Badge>
                              <StatusBadge status={interaction.status} />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{interaction.sourceDetail || interaction.source}</span>
                              <span>•</span>
                              <span>{formatDateTime(interaction.timestamp)}</span>
                              <span>•</span>
                              <span>Last: {interaction.lastContact ? formatDateTime(interaction.lastContact) : "No contact"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <ArrowRight className="h-4 w-4" />
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