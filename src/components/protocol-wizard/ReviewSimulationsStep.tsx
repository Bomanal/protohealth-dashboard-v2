import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ProtocolData } from "../CreateProtocolWizard"
import { ArrowLeft, ArrowRight, Play, FileText, Volume2, MessageSquare, Eye, User, Flag, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface ReviewSimulationsStepProps {
  data: ProtocolData
  onNext: () => void
  onBack: () => void
}

const mockSimulations = [
  {
    id: 1,
    persona: "35yo Male - Acute chest pain, sweating, shortness of breath",
    outcome: "Emergency Referral",
    diagnosis: "Suspected MI",
    thread: "Chest Pain → Severity Assessment → Associated Symptoms → Risk Factors → Emergency Protocol",
    audioLength: "4:32",
    hasTranscript: true,
    hasIssue: false,
    issueDescription: ""
  },
  {
    id: 2,
    persona: "42yo Female - Mild chest discomfort after exercise",
    outcome: "Cardiology Consult",
    diagnosis: "Stable Angina",
    thread: "Chest Pain → Exercise Related → Previous Episodes → Cardiology Referral",
    audioLength: "3:18",
    hasTranscript: true,
    hasIssue: false,
    issueDescription: ""
  },
  {
    id: 3,
    persona: "28yo Male - Sharp chest pain, anxiety symptoms",
    outcome: "Self-Care with Follow-up",
    diagnosis: "Anxiety-related",
    thread: "Chest Pain → Character Assessment → Stress Factors → Reassurance Protocol",
    audioLength: "5:45",
    hasTranscript: true,
    hasIssue: false,
    issueDescription: ""
  },
  {
    id: 4,
    persona: "67yo Female - Gradual onset chest tightness, fatigue",
    outcome: "GP Follow-up",
    diagnosis: "Possible Heart Failure",
    thread: "Chest Pain → Gradual Onset → Associated Fatigue → GP Referral",
    audioLength: "6:12",
    hasTranscript: true,
    hasIssue: false,
    issueDescription: ""
  },
  {
    id: 5,
    persona: "45yo Male - Palpitations with chest awareness",
    outcome: "Cardiology Consult",
    diagnosis: "Arrhythmia",
    thread: "Palpitations → Heart Rate Assessment → Chest Symptoms → Cardiology",
    audioLength: "4:05",
    hasTranscript: true,
    hasIssue: false,
    issueDescription: ""
  }
]

export function ReviewSimulationsStep({ data, onNext, onBack }: ReviewSimulationsStepProps) {
  const [selectedSimulation, setSelectedSimulation] = useState<typeof mockSimulations[0] | null>(null)
  const [simulations, setSimulations] = useState(mockSimulations)
  const [flagDialogOpen, setFlagDialogOpen] = useState(false)
  const [flagSimulationId, setFlagSimulationId] = useState<number | null>(null)
  const [flagDescription, setFlagDescription] = useState("")

  const getOutcomeBadgeVariant = (outcome: string) => {
    switch (outcome) {
      case "Emergency Referral":
        return "destructive"
      case "Cardiology Consult":
        return "default"
      case "Self-Care with Follow-up":
        return "secondary"
      case "GP Follow-up":
        return "outline"
      default:
        return "secondary"
    }
  }

  const handleFlagIssue = (simulationId: number) => {
    setFlagSimulationId(simulationId)
    setFlagDialogOpen(true)
  }

  const submitFlag = () => {
    if (flagSimulationId && flagDescription.trim()) {
      setSimulations(prev => prev.map(sim => 
        sim.id === flagSimulationId 
          ? { ...sim, hasIssue: true, issueDescription: flagDescription }
          : sim
      ))
      setFlagDialogOpen(false)
      setFlagDescription("")
      setFlagSimulationId(null)
      toast.success("Issue flagged successfully")
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Review Simulation Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Simulation #</TableHead>
                  <TableHead>Patient Persona</TableHead>
                  <TableHead>Protocol Outcome</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {simulations.map((simulation) => (
                  <TableRow key={simulation.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        #{simulation.id}
                        {simulation.hasIssue && (
                          <Flag className="h-4 w-4 text-warning" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-sm">{simulation.persona}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getOutcomeBadgeVariant(simulation.outcome)}>
                        {simulation.outcome}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{simulation.diagnosis}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedSimulation(simulation)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Simulation #{simulation.id} Details</DialogTitle>
                              <DialogDescription>
                                Complete simulation results and interaction history
                              </DialogDescription>
                            </DialogHeader>
                            {selectedSimulation && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <Card>
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-sm">Patient Persona</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <p className="text-sm">{selectedSimulation.persona}</p>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-sm">Protocol Thread</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <p className="text-sm">{selectedSimulation.thread}</p>
                                    </CardContent>
                                  </Card>
                                </div>
                                
                                <div className="flex gap-4">
                                  <Button variant="outline" className="flex-1">
                                    <Volume2 className="h-4 w-4 mr-2" />
                                    Listen to Audio ({selectedSimulation.audioLength})
                                  </Button>
                                  <Button variant="outline" className="flex-1">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Read Transcript
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button size="sm" variant="outline">
                          <Volume2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={simulation.hasIssue ? "destructive" : "outline"}
                          onClick={() => handleFlagIssue(simulation.id)}
                        >
                          <Flag className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Simulation Summary</h3>
            <div className="grid grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Simulations:</span>
                <div className="font-medium">{simulations.length}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Emergency Referrals:</span>
                <div className="font-medium text-destructive">
                  {simulations.filter(s => s.outcome === "Emergency Referral").length}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Specialist Referrals:</span>
                <div className="font-medium">
                  {simulations.filter(s => s.outcome === "Cardiology Consult").length}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Self-Care Outcomes:</span>
                <div className="font-medium text-success">
                  {simulations.filter(s => s.outcome === "Self-Care with Follow-up").length}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Flagged Issues:</span>
                <div className="font-medium text-warning">
                  {simulations.filter(s => s.hasIssue).length}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={onNext}>
              Continue to Live Testing
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Flag Issue Dialog */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Flag Issue with Simulation #{flagSimulationId}
            </DialogTitle>
            <DialogDescription>
              Describe the issue you found with this simulation. This will help improve the protocol.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="issue-description">Issue Description</Label>
              <Textarea
                id="issue-description"
                value={flagDescription}
                onChange={(e) => setFlagDescription(e.target.value)}
                placeholder="Describe what's wrong with this simulation..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setFlagDialogOpen(false)
                  setFlagDescription("")
                  setFlagSimulationId(null)
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={submitFlag}
                disabled={!flagDescription.trim()}
              >
                <Flag className="h-4 w-4 mr-2" />
                Flag Issue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}