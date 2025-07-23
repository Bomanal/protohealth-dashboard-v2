import { useState } from "react"
import { useParams } from "react-router-dom"
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

export default function PatientInteractionDetails() {
  const { interactionId } = useParams()
  const interaction = mockPatientInteractions.find(i => i.id === interactionId)

  if (!interaction) {
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

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
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
    if (interaction.source === "outbound_flow") {
      switch (interaction.status) {
        case "needs_action": return "Needs action"
        case "engaged": return "Completed"
        case "message_sent": return "No contact"
        case "in_queue": return "In queue"
        default: return interaction.status
      }
    } else {
      // Inbound
      switch (interaction.status) {
        case "needs_action": return "Needs action"
        case "engaged": return "Completed"
        case "scheduled": return "Completed"
        case "in_queue": return "Abandoned"
        default: return interaction.status
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
                {interaction.patientName} • {interaction.patientId}
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
                    <p className="text-lg font-semibold">{interaction.patientName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">DOB</label>
                    <p className="text-lg">{interaction.dateOfBirth}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Patient ID</label>
                    <p className="text-lg font-mono">{interaction.patientId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <p className="text-lg">{interaction.phoneNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Call Number</label>
                    <p className="text-lg font-semibold">#{interaction.callNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Interaction</label>
                    <p className="text-lg">{formatDateTime(interaction.timestamp)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Channel Subdisposition</label>
                    <p className="text-lg">
                      {interaction.source === "outbound_flow" 
                        ? interaction.sourceDetail || "Outbound Flow"
                        : interaction.source.replace("_", " ")
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Channel</label>
                    <div className="flex items-center gap-2 mt-1">
                      {getSourceIcon(interaction.source)}
                      <span className="text-lg">{getChannelType(interaction.source)}</span>
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
                    <p className="text-lg">{interaction.preliminaryDiagnosis || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Triage Outcome</label>
                    <p className="text-lg">
                      {shouldShowTriageOutcome() ? (interaction.triageOutcome || "—") : "—"}
                    </p>
                  </div>
                </div>

                {/* Clinical Summary */}
                {interaction.clinicalSummary && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Clinical Summary</label>
                    <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm leading-relaxed">{interaction.clinicalSummary}</p>
                    </div>
                  </div>
                )}

                {/* Patient Issue */}
                {interaction.patientIssue && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Patient Issue</label>
                    <div className="mt-2 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                      <p className="text-sm leading-relaxed">{interaction.patientIssue}</p>
                    </div>
                  </div>
                )}

                {/* Medical History */}
                {interaction.medicalHistory && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Medical History</label>
                    <div className="mt-2 p-4 bg-info/10 border border-info/20 rounded-lg">
                      <p className="text-sm leading-relaxed">{interaction.medicalHistory}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversation History */}
            {interaction.conversationHistory && (
              <ConversationHistory 
                messages={interaction.conversationHistory}
                patientName={interaction.patientName}
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
                      {formatDateTime(interaction.timestamp)}
                    </p>
                  </div>
                </div>
                {interaction.lastContact && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-success mt-2" />
                    <div>
                      <p className="font-medium">Last Contact</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(interaction.lastContact)}
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