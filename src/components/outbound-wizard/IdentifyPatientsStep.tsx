import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { OutboundCallData, PatientData } from "../TriggerOutboundCallsWizard"
import { ArrowRight, Upload, Plus, Trash2, Info, X } from "lucide-react"

interface IdentifyPatientsStepProps {
  data: OutboundCallData
  onUpdate: (updates: Partial<OutboundCallData>) => void
  onNext: () => void
}

const CALL_TYPES = [
  "Post-surgery follow-up",
  "Appointment reminder", 
  "Test results review",
  "Medication check",
  "Wellness check",
  "Insurance verification"
]

export function IdentifyPatientsStep({ data, onUpdate, onNext }: IdentifyPatientsStepProps) {
  const [activeTab, setActiveTab] = useState("manual")
  const [currentPatient, setCurrentPatient] = useState<PatientData>({
    name: "",
    dob: "",
    gender: "",
    phoneNumber: "",
    callType: "",
    medicalConditions: "",
    additionalNotes: ""
  })
  const [uploadErrors, setUploadErrors] = useState<string[]>([])

  const addPatient = () => {
    if (currentPatient.name && currentPatient.dob && currentPatient.gender && currentPatient.phoneNumber && currentPatient.callType) {
      const newPatient = { ...currentPatient, id: Date.now().toString() }
      onUpdate({ 
        patients: [...data.patients, newPatient]
      })
      setCurrentPatient({
        name: "",
        dob: "",
        gender: "",
        phoneNumber: "",
        callType: "",
        medicalConditions: "",
        additionalNotes: ""
      })
    }
  }

  const removePatient = (id: string) => {
    onUpdate({
      patients: data.patients.filter(p => p.id !== id)
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Mock CSV parsing - in real app would parse actual CSV
      const mockPatients: PatientData[] = [
        {
          id: "1",
          name: "John Doe",
          dob: "1980-01-15",
          gender: "Male",
          phoneNumber: "(555) 123-4567",
          callType: "Post-surgery follow-up",
          medicalConditions: "Hypertension, Diabetes",
          additionalNotes: "Recent cardiac surgery"
        },
        {
          id: "2", 
          name: "Jane Smith",
          dob: "1975-06-22",
          gender: "Female",
          phoneNumber: "(555) 987-6543",
          callType: "Invalid Call Type", // This will trigger an error
          medicalConditions: "Asthma",
          additionalNotes: ""
        }
      ]
      
      // Validate call types
      const errors: string[] = []
      const validPatients: PatientData[] = []
      
      mockPatients.forEach((patient, index) => {
        if (!CALL_TYPES.includes(patient.callType)) {
          errors.push(`Row ${index + 1}: Invalid call type "${patient.callType}"`)
        } else {
          validPatients.push(patient)
        }
      })
      
      setUploadErrors(errors)
      onUpdate({ patients: [...data.patients, ...validPatients] })
    }
  }

  const canProceed = data.patients.length > 0 && uploadErrors.length === 0

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Identify patients you'd like to call
            </span>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Info className="h-4 w-4 mr-2" />
                  Field requirements
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Field format requirements</DialogTitle>
                  <DialogDescription>
                    Review the expected format for each field when uploading patient data.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Patient name</h4>
                    <p className="text-sm text-muted-foreground">Full name (First Last). Example: "John Doe"</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Date of birth</h4>
                    <p className="text-sm text-muted-foreground">Format: YYYY-MM-DD. Example: "1980-01-15"</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Gender</h4>
                    <p className="text-sm text-muted-foreground">Options: "Male", "Female", "Other"</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Phone number</h4>
                    <p className="text-sm text-muted-foreground">Format: (XXX) XXX-XXXX. Example: "(555) 123-4567"</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Call type</h4>
                    <p className="text-sm text-muted-foreground">Must match exactly: {CALL_TYPES.join(", ")}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Medical conditions</h4>
                    <p className="text-sm text-muted-foreground">Free text. Separate multiple conditions with commas.</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Additional notes</h4>
                    <p className="text-sm text-muted-foreground">Free text. Any relevant information for the call.</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Enter manually</TabsTrigger>
              <TabsTrigger value="upload">Upload CSV</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Patient name *</Label>
                  <Input
                    id="name"
                    value={currentPatient.name}
                    onChange={(e) => setCurrentPatient(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={currentPatient.dob}
                    onChange={(e) => setCurrentPatient(prev => ({ ...prev, dob: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={currentPatient.gender} onValueChange={(value) => setCurrentPatient(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone number *</Label>
                  <Input
                    id="phoneNumber"
                    value={currentPatient.phoneNumber}
                    onChange={(e) => setCurrentPatient(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="callType">Call type *</Label>
                  <Select value={currentPatient.callType} onValueChange={(value) => setCurrentPatient(prev => ({ ...prev, callType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select call type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CALL_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conditions">Existing medical conditions</Label>
                <Textarea
                  id="conditions"
                  value={currentPatient.medicalConditions}
                  onChange={(e) => setCurrentPatient(prev => ({ ...prev, medicalConditions: e.target.value }))}
                  placeholder="Hypertension, Diabetes, etc."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional notes</Label>
                <Textarea
                  id="notes"
                  value={currentPatient.additionalNotes}
                  onChange={(e) => setCurrentPatient(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  placeholder="Any relevant information for the call..."
                  rows={3}
                />
              </div>

              <Button
                onClick={addPatient}
                disabled={!currentPatient.name || !currentPatient.dob || !currentPatient.gender || !currentPatient.phoneNumber || !currentPatient.callType}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add patient
              </Button>
            </TabsContent>

            <TabsContent value="upload" className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <h3 className="font-medium">Upload patient data</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a CSV file with patient information. Make sure call types match the available protocols.
                  </p>
                  <div className="flex justify-center">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button variant="outline">Select CSV File</Button>
                    </label>
                  </div>
                </div>
              </div>

              {uploadErrors.length > 0 && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <h4 className="font-medium text-destructive mb-2">Upload issues found:</h4>
                  <ul className="space-y-1">
                    {uploadErrors.map((error, index) => (
                      <li key={index} className="text-sm text-destructive">• {error}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please correct these issues before proceeding.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {data.patients.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Added patients ({data.patients.length})</h3>
              </div>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>DOB</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Call type</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.dob}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>{patient.phoneNumber}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{patient.callType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePatient(patient.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button 
              onClick={onNext} 
              disabled={!canProceed}
              className="w-full"
            >
              Continue to schedule call
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}