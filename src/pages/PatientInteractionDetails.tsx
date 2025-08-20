import { useParams } from "react-router-dom"
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/StatusBadge"
import { ConversationHistory } from "@/components/ConversationHistory"
import { mockPatientInteractions } from "@/data/mockData"
import { 
  ArrowLeft, 
  Phone, 
  MessageSquare, 
  Calendar,
  AlertTriangle,
  User,
  Clock,
  Building,
  FileText,
  Edit
} from "lucide-react"

type CaseDetailsItem = {
  call_id: string;
  phone_number: string;
  user_name: string | null;
  last_call: string | null;
  status: string | null;
  preliminary_diagnosis: string | null;
  triage_outcome: string | null;
  call_log: any;
  summary: string | null;
  medical_history: string | null;
  issue: string | null;
  dob: string | null;
};

export default function PatientInteractionDetails() {
  const { id } = useParams()
  const [details, setDetails] = useState<CaseDetailsItem | null>(null)
  const [loading, setLoading] = useState(true)
  const interaction = mockPatientInteractions.find(i => i.id === id)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    // Only fetch if it's a UUID (API data)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
              fetch(`/case-details/${id}`)
        .then(res => res.json())
        .then(data => {
          setDetails(data)
          setLoading(false)
        })
        .catch(err => {
          console.error("Failed to fetch case details:", err)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Card>
            <CardContent className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Loading...</h3>
              <p className="text-muted-foreground">Fetching case details.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!details && !interaction) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Card>
            <CardContent className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Interaction Not Found</h3>
              <p className="text-muted-foreground">The requested patient interaction could not be found.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  // Use API data if available, otherwise mock data
  const data = details || interaction

  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return dateObj.toLocaleDateString("en-US", { 
      month: "long", 
      day: "numeric", 
      year: "numeric",
      hour: "2-digit", 
      minute: "2-digit" 
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive"
      case "medium": return "secondary"
      case "low": return "outline"
      default: return "secondary"
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "inbound_phone": return <Phone className="h-4 w-4" />
      case "inbound_text": return <MessageSquare className="h-4 w-4" />
      case "inbound_email": return <MessageSquare className="h-4 w-4" />
      case "inbound_scheduling": return <Calendar className="h-4 w-4" />
      case "outbound_flow": return <FileText className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getChannelType = (source: string) => {
    switch (source) {
      case "outbound_flow": return "Outbound"
      case "inbound_phone": return "Phone"
      case "inbound_text": return "Text"
      case "inbound_email": return "Email"
      case "inbound_scheduling": return "Scheduling"
      default: return source
    }
  }

  const getStatusForDisplay = () => {
    if ("source" in data && data.source === "outbound_flow") {
      switch (data.status) {
        case "needs_action": return "Needs action"
        case "engaged": return "Completed"
        case "message_sent": return "No contact"
        case "in_queue": return "In queue"
        default: return data.status
      }
    } else {
      // Inbound
      switch (data.status) {
        case "needs_action": return "Needs action"
        case "engaged": return "Completed"
        case "scheduled": return "Completed"
        case "in_queue": return "Abandoned"
        default: return data.status
      }
    }
  }

  const shouldShowTriageOutcome = () => {
    const status = getStatusForDisplay().toLowerCase()
    return status === "completed" || status === "needs action"
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Interactions
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Patient Interaction Details
              </h1>
              <p className="text-muted-foreground mt-1">
                {"user_name" in data ? (data.user_name || "John Smith") : ("patientName" in data ? data.patientName : "John Smith")} • {"patientId" in data ? data.patientId : ("call_id" in data ? data.call_id : "N/A")}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-1" />
              Edit Notes
            </Button>
            <Button>
              <Phone className="h-4 w-4 mr-1" />
              Call Patient
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Interaction Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Patient Name</label>
                    <p className="text-lg font-semibold">{"user_name" in data ? (data.user_name || "John Smith") : ("patientName" in data ? data.patientName : "John Smith")}</p>
                  </div>
                  <div>
                                      <label className="text-sm font-medium text-muted-foreground">DOB</label>
                  <p className="text-lg">{"dob" in data ? data.dob : ("dateOfBirth" in data ? data.dateOfBirth : "1985-03-15")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Patient ID</label>
                    <p className="text-lg font-mono">{"patientId" in data ? data.patientId : (Math.floor(Math.random() * 90000 + 10000).toString())}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <p className="text-lg">{"phone_number" in data ? data.phone_number : ("phoneNumber" in data ? data.phoneNumber : "N/A")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Call Number</label>
                    <p className="text-lg font-semibold">{"call_id" in data ? `#${data.call_id}` : ("callNumber" in data ? `#${data.callNumber}` : "N/A")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Interaction</label>
                    <p className="text-lg">{"timestamp" in data ? formatDateTime(data.timestamp) : ("last_call" in data && data.last_call ? formatDateTime(data.last_call) : "N/A")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Channel Subdisposition</label>
                    <p className="text-lg">
                      {"source" in data ? (data.source === "outbound_flow" 
                        ? (data.sourceDetail || "Outbound Flow")
                        : data.source.replace("_", " ")) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Channel</label>
                    <div className="flex items-center gap-2 mt-1">
                      {"source" in data ? getSourceIcon(data.source) : <MessageSquare className="h-4 w-4" />}
                      <span className="text-lg">{"source" in data ? getChannelType(data.source) : "N/A"}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge variant="outline" className="text-sm">
                        {getStatusForDisplay()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Preliminary Diagnosis</label>
                    <p className="text-lg">{"preliminary_diagnosis" in data ? data.preliminary_diagnosis : ("preliminaryDiagnosis" in data ? data.preliminaryDiagnosis : "—")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Triage Outcome</label>
                    <p className="text-lg">
                      {"triage_outcome" in data ? data.triage_outcome : ("triageOutcome" in data ? data.triageOutcome : "—")}
                    </p>
                  </div>
                </div>

                {/* Clinical Summary */}
                {(("summary" in data && data.summary) || ("clinicalSummary" in data && data.clinicalSummary)) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Clinical Summary</label>
                    <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm leading-relaxed">{"summary" in data ? data.summary : data.clinicalSummary}</p>
                    </div>
                  </div>
                )}

                {/* Patient Issue */}
                {(("issue" in data && data.issue) || ("patientIssue" in data && data.patientIssue)) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Patient Issue</label>
                    <div className="mt-2 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                      <p className="text-sm leading-relaxed">{"issue" in data ? data.issue : data.patientIssue}</p>
                    </div>
                  </div>
                )}

                {/* Medical History */}
                {(("medical_history" in data && data.medical_history) || ("medicalHistory" in data && data.medicalHistory)) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Medical History</label>
                    <div className="mt-2 p-4 bg-info/10 border border-info/20 rounded-lg">
                      <p className="text-sm leading-relaxed">{"medical_history" in data ? data.medical_history : data.medicalHistory}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversation History */}
            {(("call_log" in data && data.call_log) || ("conversationHistory" in data && (data as any).conversationHistory)) && (
              <ConversationHistory 
                messages={("call_log" in data && data.call_log) ? 
                  data.call_log.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                  })) : 
                  (data as any).conversationHistory
                }
                patientName={"user_name" in data ? (data.user_name || "John Smith") : ("patientName" in data ? data.patientName : "John Smith")}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium">Interaction Created</p>
                    <p className="text-sm text-muted-foreground">
                      {"timestamp" in data ? formatDateTime(data.timestamp) : ("last_call" in data && data.last_call ? formatDateTime(data.last_call) : "N/A")}
                    </p>
                  </div>
                </div>
                {("lastContact" in data && data.lastContact) && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-success mt-2" />
                    <div>
                      <p className="font-medium">Last Contact</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(data.lastContact)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Patient
                </Button>
                <Button className="w-full" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Follow-up
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Add Clinical Note
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}