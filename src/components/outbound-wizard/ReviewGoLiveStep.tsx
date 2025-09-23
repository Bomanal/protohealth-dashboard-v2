import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { OutboundCallData } from "../TriggerOutboundCallsWizard"
import { ArrowLeft, Play, Calendar, Clock, Users, Phone } from "lucide-react"

interface ReviewGoLiveStepProps {
  data: OutboundCallData
  onNext: () => void
  onBack: () => void
}

export function ReviewGoLiveStep({ data, onNext, onBack }: ReviewGoLiveStepProps) {
  const getScheduleText = () => {
    switch (data.schedulingOption) {
      case 'now':
        return 'Immediately after going live'
      case 'best_time':
        return 'System-determined optimal time'
      case 'custom':
        return data.customDateTime ? data.customDateTime.toLocaleString() : 'Not specified'
      default:
        return 'Not specified'
    }
  }

  const getScheduleIcon = () => {
    switch (data.schedulingOption) {
      case 'now':
        return <Play className="h-4 w-4" />
      case 'best_time':
        return <Clock className="h-4 w-4" />
      case 'custom':
        return <Calendar className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const uniqueCallTypes = [...new Set(data.patients.map(p => p.callType))]

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Review & Go Live
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Campaign Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-accent/50 border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Patients</span>
                </div>
                <p className="text-2xl font-bold text-primary">{data.patients.length}</p>
              </div>

              <div className="p-4 rounded-lg bg-accent/50 border">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Call Types</span>
                </div>
                <p className="text-2xl font-bold text-primary">{uniqueCallTypes.length}</p>
              </div>

              <div className="p-4 rounded-lg bg-accent/50 border">
                <div className="flex items-center gap-2 mb-2">
                  {getScheduleIcon()}
                  <span className="text-sm font-medium">Timing</span>
                </div>
                <p className="text-sm text-muted-foreground">{getScheduleText()}</p>
              </div>
            </div>

            <Separator />

            {/* Call Types & Protocols */}
            <div>
              <h3 className="font-medium mb-3">Active Call Types & Protocols</h3>
              <div className="space-y-2">
                {uniqueCallTypes.map(callType => (
                  <div key={callType} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="font-medium">{callType}</span>
                    <Badge variant="secondary">
                      Protocol: {callType.replace(/\s+/g, '_').toLowerCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Patient List */}
            <div>
              <h3 className="font-medium mb-3">Patients to be Called ({data.patients.length})</h3>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>DOB</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Call Type</TableHead>
                      <TableHead>Medical Conditions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.dob}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{patient.callType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm text-muted-foreground truncate">
                              {patient.medicalConditions || "None specified"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <Separator />

            {/* Final Actions */}
            <div className="bg-muted/30 p-6 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Play className="h-4 w-4 text-primary" />
                Ready to Go Live?
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Once you click "Go Live", the outbound calling system will be triggered according to your schedule. 
                You can monitor progress and manage calls from the Patient Interactions dashboard.
              </p>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={onBack} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Schedule
                </Button>
                <Button onClick={onNext} className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90">
                  <Play className="h-4 w-4 mr-2" />
                  Go Live & Trigger Calls
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}