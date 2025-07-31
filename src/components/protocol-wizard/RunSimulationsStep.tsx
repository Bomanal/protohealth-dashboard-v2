import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ProtocolData } from "../CreateProtocolWizard"
import { ArrowLeft, Check, Play, Volume2, MessageSquare, Plus, User, Mic, Phone } from "lucide-react"

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

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Run Live Simulations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Persona Selection */}
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

            {/* Custom Persona Option */}
            <Card 
              className={`cursor-pointer transition-all ${
                showCustom ? 'ring-2 ring-primary' : 'hover:shadow-md'
              }`}
              onClick={() => {
                setShowCustom(true)
                setSelectedPersona(null)
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-medium">Create Custom Persona</h4>
                </div>
                
                {showCustom && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-persona">Describe the patient scenario</Label>
                    <Textarea
                      id="custom-persona"
                      value={customPersona}
                      onChange={(e) => setCustomPersona(e.target.value)}
                      placeholder="e.g., 55yo female with intermittent chest pain, history of hypertension..."
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Simulation Controls */}
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
              <Check className="h-4 w-4 mr-2" />
              Complete Protocol Creation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}