import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProtocolData } from "../CreateProtocolWizard"
import { ArrowLeft, Check, Play, Volume2, MessageSquare, Plus, User, Mic, Phone, Flag, AlertTriangle, Rocket } from "lucide-react"
import { toast } from "sonner"

interface RunSimulationsStepProps {
  data: ProtocolData
  onComplete: () => void
  onBack: () => void
}

const predefinedPersonas = [
  {
    id: 1,
    name: "Acute Chest Pain",
    description: "65yo male presenting with severe crushing chest pain, radiating to left arm, with nausea and sweating"
  },
  {
    id: 2,
    name: "Exercise-Related Discomfort", 
    description: "45yo female with chest tightness during physical activity, relieved by rest"
  },
  {
    id: 3,
    name: "Anxiety Presentation",
    description: "28yo male with sharp, stabbing chest pain, rapid heartbeat, and difficulty breathing during stress"
  },
  {
    id: 4,
    name: "Gradual Onset Symptoms",
    description: "72yo female with progressive fatigue, mild chest pressure, and ankle swelling"
  },
  {
    id: 5,
    name: "Palpitation Complaint",
    description: "38yo male reporting irregular heartbeat, chest fluttering, and occasional dizziness"
  }
]

export function RunSimulationsStep({ data, onComplete, onBack }: RunSimulationsStepProps) {
  const [selectedPersona, setSelectedPersona] = useState<number | null>(null)
  const [customPersona, setCustomPersona] = useState("")
  const [showCustom, setShowCustom] = useState(false)
  const [simulationResult, setSimulationResult] = useState<{
    outcome: string
    diagnosis: string
    transcript: string
  } | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [simulationMode, setSimulationMode] = useState<'select' | 'create' | 'live'>('select')
  const [flagDialogOpen, setFlagDialogOpen] = useState(false)
  const [flagDescription, setFlagDescription] = useState("")

  const runSimulation = async (personaText: string) => {
    setIsRunning(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Mock simulation result
    setSimulationResult({
      outcome: "Cardiology Consult",
      diagnosis: "Suspected Stable Angina",
      transcript: `AI: Hello, I'm here to help assess your symptoms. Can you tell me about the chest discomfort you're experiencing?

Patient: ${personaText.split(',')[0]} - I've been having this tightness in my chest, especially when I'm active.

AI: I understand. When did you first notice this chest tightness? And does it happen every time you're active?

Patient: It started about 2 weeks ago. Yes, mainly when I walk upstairs or exercise.

AI: Does the discomfort go away when you rest?

Patient: Yes, it usually goes away after a few minutes of rest.

AI: Have you experienced any other symptoms like shortness of breath, nausea, or arm pain?

Patient: Sometimes I feel a bit short of breath, but no nausea or arm pain.

AI: Based on your symptoms, I recommend scheduling a consultation with a cardiologist for further evaluation. This could be related to your heart's blood supply during physical activity.`
    })
    
    setIsRunning(false)
  }

  const handleRunSimulation = () => {
    const persona = selectedPersona 
      ? predefinedPersonas.find(p => p.id === selectedPersona)?.description || ""
      : customPersona
    
    if (persona) {
      runSimulation(persona)
    }
  }

  const canRunSimulation = selectedPersona || (showCustom && customPersona.trim())

  const handleFlagIssue = () => {
    setFlagDialogOpen(true)
  }

  const submitFlag = () => {
    if (flagDescription.trim()) {
      setFlagDialogOpen(false)
      setFlagDescription("")
      toast.success("Issue flagged successfully")
    }
  }

  const handleLiveCall = () => {
    // Navigate to live call placeholder
    toast.info("Live call functionality coming soon!")
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Run Live Simulations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Choose Simulation Type</h3>
            <div className="grid grid-cols-3 gap-4">
              <Card 
                className={`cursor-pointer transition-all ${
                  simulationMode === 'select' ? 'ring-2 ring-primary' : 'hover:shadow-md'
                }`}
                onClick={() => setSimulationMode('select')}
              >
                <CardContent className="p-4 text-center">
                  <User className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Select Patient Persona</h4>
                  <p className="text-sm text-muted-foreground">Choose from predefined scenarios</p>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all ${
                  simulationMode === 'create' ? 'ring-2 ring-primary' : 'hover:shadow-md'
                }`}
                onClick={() => setSimulationMode('create')}
              >
                <CardContent className="p-4 text-center">
                  <Plus className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Create Custom Persona</h4>
                  <p className="text-sm text-muted-foreground">Define your own patient scenario</p>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all ${
                  simulationMode === 'live' ? 'ring-2 ring-primary' : 'hover:shadow-md'
                }`}
                onClick={() => setSimulationMode('live')}
              >
                <CardContent className="p-4 text-center">
                  <Phone className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Do a Live Call</h4>
                  <p className="text-sm text-muted-foreground">Real-time interaction testing</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Persona Selection */}
          {simulationMode === 'select' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Patient Persona</h3>
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predefinedPersonas.map((persona) => (
                  <Card 
                    key={persona.id}
                    className={`cursor-pointer transition-all ${
                      selectedPersona === persona.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                    }`}
                    onClick={() => {
                      setSelectedPersona(persona.id)
                      setShowCustom(false)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground mt-1" />
                        <div>
                          <h4 className="font-medium mb-1">{persona.name}</h4>
                          <p className="text-sm text-muted-foreground">{persona.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Custom Persona Creation */}
          {simulationMode === 'create' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Create Custom Persona</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="custom-persona">Describe the patient scenario</Label>
                      <Textarea
                        id="custom-persona"
                        value={customPersona}
                        onChange={(e) => setCustomPersona(e.target.value)}
                        placeholder="e.g., 55yo female with intermittent chest pain, history of hypertension..."
                        rows={4}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Live Call */}
          {simulationMode === 'live' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Live Call Simulation</h3>
              <Card>
                <CardContent className="p-6 text-center">
                  <Phone className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h4 className="font-medium mb-2">Real-time Protocol Testing</h4>
                  <p className="text-muted-foreground mb-4">
                    Test your protocol with a live AI interaction. Speak naturally and see how the protocol responds.
                  </p>
                  <Button onClick={handleLiveCall}>
                    <Phone className="h-4 w-4 mr-2" />
                    Start Live Call
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Simulation Controls */}
          {(simulationMode === 'select' || simulationMode === 'create') && (
            <div className="flex gap-4">
              <Button 
                onClick={handleRunSimulation}
                disabled={!canRunSimulation || isRunning}
                className="flex-1"
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Run Text Simulation
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                disabled={!canRunSimulation}
                className="flex-1"
              >
                <Mic className="h-4 w-4 mr-2" />
                Run Audio Simulation
              </Button>
            </div>
          )}

          {/* Simulation Results */}
          {simulationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Simulation Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Protocol Outcome</Label>
                    <div className="mt-1">
                      <Badge variant="default">{simulationResult.outcome}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Diagnosis</Label>
                    <div className="mt-1">
                      <Badge variant="outline">{simulationResult.diagnosis}</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Conversation Transcript</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap font-mono">
                      {simulationResult.transcript}
                    </pre>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Listen to Audio
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Test Live Call
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleFlagIssue}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Flag Issue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={onComplete}>
              <Rocket className="h-4 w-4 mr-2" />
              Go Live!
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
              Flag Issue with Simulation
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