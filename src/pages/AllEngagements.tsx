import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
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

type CaseListItem = {
  call_id: string;
  phone_number: string;
  user_name: string | null;
  last_call: string | null;
  status: string | null;
  preliminary_diagnosis: string | null;
  triage_outcome: string | null;
};

export default function AllEngagements() {
  const navigate = useNavigate()
  const [cases, setCases] = useState<CaseListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  useEffect(() => {
    fetch("http://localhost:8000/case-list") // Use your actual API URL
      .then((res) => res.json())
      .then((data) => {
        setCases(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch case list:", err)
        setLoading(false)
      })
  }, [])

  const filteredInteractions = (cases.length > 0 ? cases : mockPatientInteractions).filter(interaction => {
    const name = "patientName" in interaction ? interaction.patientName : ""
    const sourceDetail = "sourceDetail" in interaction ? interaction.sourceDetail : ""
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (sourceDetail?.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesDepartment = selectedDepartment === "all" || ("department" in interaction && interaction.department === selectedDepartment)
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

  const formatDateTime = (timestamp: Date | string) => {
    const dateObj = typeof timestamp === "string" ? new Date(timestamp) : timestamp
    return dateObj.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      hour: "2-digit", 
      minute: "2-digit" 
    })
  }

  const totalEngagements = (cases.length > 0 ? cases : mockPatientInteractions).length
  const engagedCount = (cases.length > 0 ? cases : mockPatientInteractions).filter(i => i.status === "engaged").length
  const needsActionCount = (cases.length > 0 ? cases : mockPatientInteractions).filter(i => i.status === "needs_action").length
  const inQueueCount = (cases.length > 0 ? cases : mockPatientInteractions).filter(i => i.status === "in_queue").length

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
            {filteredInteractions.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No engagements found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters.</p>
              </div>
            ) : (
            <div className="space-y-4">
              {filteredInteractions.map((interaction) => {
                // Safe property access for both API and mock data
                const patientName = "user_name" in interaction ? (interaction.user_name || "John Smith") : ("patientName" in interaction ? interaction.patientName : "John Smith")
                const dateOfBirth = "dateOfBirth" in interaction ? interaction.dateOfBirth : "1985-03-15"
                const callNumber = "call_id" in interaction ? interaction.call_id : ("callNumber" in interaction ? interaction.callNumber : "N/A")
                const phoneNumber = "phone_number" in interaction ? interaction.phone_number : ("phoneNumber" in interaction ? interaction.phoneNumber : "N/A")
                const preliminaryDiagnosis = "preliminary_diagnosis" in interaction ? interaction.preliminary_diagnosis : ("preliminaryDiagnosis" in interaction ? interaction.preliminaryDiagnosis : "N/A")
                const triageOutcome = "triage_outcome" in interaction ? interaction.triage_outcome : ("triageOutcome" in interaction ? interaction.triageOutcome : "N/A")
                const timestamp = "timestamp" in interaction ? interaction.timestamp : ("last_call" in interaction ? interaction.last_call : "N/A")
                const sourceDetail = "sourceDetail" in interaction ? interaction.sourceDetail : ""
                const department = "department" in interaction ? interaction.department : "N/A"
                // Status is always present
                const status = interaction.status

                const getChannelSubdisposition = () => {
                  if ("source" in interaction && interaction.source === "outbound_flow") {
                    return sourceDetail || "Outbound Flow"
                  }
                  return "source" in interaction ? interaction.source.replace("_", " ") : ""
                }

                const getStatusForDisplay = () => {
                  if ("source" in interaction && interaction.source === "outbound_flow") {
                    switch (status) {
                      case "needs_action": return "Needs action"
                      case "engaged": return "Completed"
                      case "message_sent": return "No contact"
                      case "in_queue": return "In queue"
                      default: return status
                    }
                  } else {
                    // Inbound
                    switch (status) {
                      case "needs_action": return "Needs action"
                      case "engaged": return "Completed"
                      case "scheduled": return "Completed"
                      case "in_queue": return "Abandoned"
                      default: return status
                    }
                  }
                }

                const getStatusBadgeVariant = () => {
                  const statusDisplay = getStatusForDisplay()
                  switch (statusDisplay.toLowerCase()) {
                    case "completed": return "default"
                    case "needs action": return "destructive"
                    case "no contact": return "secondary"
                    case "in queue": return "outline"
                    case "abandoned": return "secondary"
                    default: return "outline"
                  }
                }

                const shouldShowTriageOutcome = () => {
                  const statusDisplay = getStatusForDisplay().toLowerCase()
                  return statusDisplay === "completed" || statusDisplay === "needs action"
                }

                return (
                  <Card key={callNumber} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Patient Info */}
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-lg text-foreground mb-1">
                                {patientName}
                              </h4>
                              <p className="text-sm text-muted-foreground">DOB: {dateOfBirth}</p>
                              <p className="text-sm text-muted-foreground">Call #{callNumber}</p>
                            </div>
                          </div>

                          {/* Interaction Details */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                Date & Channel
                              </p>
                              <p className="text-sm font-medium">{timestamp !== "N/A" ? formatDateTime(timestamp) : "N/A"}</p>
                              <p className="text-sm text-muted-foreground">{getChannelSubdisposition()}</p>
                            </div>
                          </div>

                          {/* Status & Diagnosis */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                Status
                              </p>
                              <Badge variant={getStatusBadgeVariant()} className="text-xs font-medium mb-2">
                                {getStatusForDisplay()}
                              </Badge>
                              <p className="text-sm text-muted-foreground">
                                {preliminaryDiagnosis || "No diagnosis"}
                              </p>
                            </div>
                          </div>

                          {/* Triage Outcome */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                Triage Outcome
                              </p>
                              <p className="text-sm font-medium">
                                {triageOutcome || "Pending"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex-shrink-0">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/patient-interaction/${callNumber}`)}
                            className="hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}