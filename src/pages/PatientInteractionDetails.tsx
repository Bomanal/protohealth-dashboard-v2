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
      case "inbound_scheduling": return <Calendar className="h-4 w-4" />
      case "outbound_flow": return <FileText className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Patient Name</label>
                    <p className="text-lg font-semibold">{interaction.patientName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Patient ID</label>
                    <p className="text-lg font-mono">{interaction.patientId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Department</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Building className="h-4 w-4" />
                      <Badge variant="outline" className="capitalize">
                        {interaction.department}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Priority</label>
                    <div className="mt-1">
                      <Badge variant={getPriorityColor(interaction.priority)} className="capitalize">
                        {interaction.priority} Priority
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Source</label>
                    <div className="flex items-center gap-2 mt-1">
                      {getSourceIcon(interaction.source)}
                      <span className="capitalize">{interaction.source.replace("_", " ")}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <StatusBadge status={interaction.status} />
                    </div>
                  </div>
                </div>

                {interaction.sourceDetail && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Source Details</label>
                    <p className="mt-1">{interaction.sourceDetail}</p>
                  </div>
                )}

                {interaction.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Clinical Notes</label>
                    <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                      <p>{interaction.notes}</p>
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

            {/* Related Information */}
            <Card>
              <CardHeader>
                <CardTitle>Related Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-sm">Recent Interactions</p>
                  <p className="text-xs text-muted-foreground">2 interactions this month</p>
                </div>
                <div>
                  <p className="font-medium text-sm">Care Team</p>
                  <p className="text-xs text-muted-foreground">
                    {interaction.department === "cardiology" ? "Dr. Martinez (Cardiology)" : "Dr. Patel (Gastroenterology)"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm">Next Appointment</p>
                  <p className="text-xs text-muted-foreground">January 25, 2024</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}