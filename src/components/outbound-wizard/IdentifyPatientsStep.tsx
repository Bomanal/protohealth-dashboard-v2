import { useRef, useState } from "react"
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
import { ArrowRight, Upload, Plus, Trash2, Info, X, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { parseCsv, digitsOnly } from "@/lib/csv"

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

const GENDERS = ["Male", "Female", "Other"]

// CSV columns: header row is required. Optional columns may be omitted.
const CSV_REQUIRED_COLUMNS = ["name", "phone_number", "dob", "gender", "call_type"] as const
const CSV_OPTIONAL_COLUMNS = ["medical_history", "patient_context"] as const
const MAX_CSV_BYTES = 1024 * 1024 // 1 MB

export function IdentifyPatientsStep({ data, onUpdate, onNext }: IdentifyPatientsStepProps) {
  const { toast } = useToast()
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false)

  // Validation functions
  const validatePatient = (patient: PatientData): Record<string, string> => {
    const errors: Record<string, string> = {}
    
    if (!patient.name || patient.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long"
    }
    
    if (!patient.dob) {
      errors.dob = "Date of birth is required"
    } else {
      const dob = new Date(patient.dob)
      const today = new Date()
      if (dob > today) {
        errors.dob = "Date of birth cannot be in the future"
      }
    }
    
    if (!patient.gender) {
      errors.gender = "Gender is required"
    }
    
    if (!patient.phoneNumber) {
      errors.phoneNumber = "Phone number is required"
    } else {
      const phoneDigits = patient.phoneNumber.replace(/\D/g, '')
      if (phoneDigits.length < 10) {
        errors.phoneNumber = "Phone number must contain at least 10 digits"
      }
    }
    
    if (!patient.callType) {
      errors.callType = "Call type is required"
    }
    
    return errors
  }

  /**
   * Returns true if a patient with this phone number already exists on the server.
   * The endpoint returns 200 with `null` when no patient matches, so the body must be checked.
   * Throws if the check could not be performed.
   */
  const checkForDuplicate = async (phoneNumber: string): Promise<boolean> => {
    const digits = digitsOnly(phoneNumber)
    const response = await fetch(`/api/patients/search/by-phone/${encodeURIComponent(digits)}`)
    if (!response.ok) {
      throw new Error(`Duplicate check failed (HTTP ${response.status})`)
    }
    const body = await response.json()
    return body !== null && body !== undefined
  }

  const resetCurrentPatient = () => {
    setCurrentPatient({
      name: "",
      dob: "",
      gender: "",
      phoneNumber: "",
      callType: "",
      medicalConditions: "",
      additionalNotes: ""
    })
    setValidationErrors({})
  }

  const addPatient = async () => {
    const errors = validatePatient(currentPatient)
    const digits = digitsOnly(currentPatient.phoneNumber)
    if (!errors.phoneNumber && data.patients.some(p => digitsOnly(p.phoneNumber) === digits)) {
      errors.phoneNumber = "This phone number is already in the call list"
    }
    setValidationErrors(errors)
    
    if (Object.keys(errors).length > 0) {
      toast({
        title: "Validation errors",
        description: "Please fix the errors before adding the patient",
        variant: "destructive"
      })
      return
    }

    // Check whether this phone number already belongs to an existing patient record
    setIsCheckingDuplicate(true)
    let duplicateCheckFailed = false
    let isDuplicate = false
    try {
      isDuplicate = await checkForDuplicate(currentPatient.phoneNumber)
    } catch {
      duplicateCheckFailed = true
    } finally {
      setIsCheckingDuplicate(false)
    }

    const newPatient = { ...currentPatient, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }
    onUpdate({
      patients: [...data.patients, newPatient]
    })
    resetCurrentPatient()

    if (duplicateCheckFailed) {
      toast({
        title: "Patient added",
        description: "Couldn't check for an existing patient record with this phone number.",
        variant: "destructive"
      })
    } else if (isDuplicate) {
      toast({
        title: "Existing patient found",
        description: "A patient with this phone number already exists. Their record will be updated with the new information.",
      })
    } else {
      toast({
        title: "Patient added successfully",
        description: `${newPatient.name} has been added to the call list`,
      })
    }
  }

  const removePatient = (id: string) => {
    onUpdate({
      patients: data.patients.filter(p => p.id !== id)
    })
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const processCsv = (text: string) => {
    const rows = parseCsv(text)
    if (rows.length === 0) {
      setUploadErrors(["The file is empty"])
      return
    }

    const header = rows[0].map(h => h.trim().toLowerCase())
    const missing = CSV_REQUIRED_COLUMNS.filter(col => !header.includes(col))
    if (missing.length > 0) {
      setUploadErrors([
        `Missing required column(s) in header row: ${missing.join(", ")}. ` +
        `Expected columns: ${[...CSV_REQUIRED_COLUMNS, ...CSV_OPTIONAL_COLUMNS].join(", ")}`
      ])
      return
    }
    if (rows.length === 1) {
      setUploadErrors(["The file has a header row but no patient rows"])
      return
    }

    const col = (row: string[], name: string) => {
      const idx = header.indexOf(name)
      return idx >= 0 ? (row[idx] ?? "").trim() : ""
    }

    const errors: string[] = []
    const validPatients: PatientData[] = []
    const seenPhones = new Set(data.patients.map(p => digitsOnly(p.phoneNumber)))

    rows.slice(1).forEach((row, i) => {
      // Row numbers are 1-based and include the header row, matching spreadsheet line numbers
      const rowNumber = i + 2
      const rawGender = col(row, "gender")
      const gender = GENDERS.find(g => g.toLowerCase() === rawGender.toLowerCase()) ?? rawGender
      const rawCallType = col(row, "call_type")
      const callType = CALL_TYPES.find(t => t.toLowerCase() === rawCallType.toLowerCase()) ?? rawCallType
      const patient: PatientData = {
        id: `csv-${Date.now()}-${rowNumber}`,
        name: col(row, "name"),
        phoneNumber: col(row, "phone_number"),
        dob: col(row, "dob"),
        gender,
        callType,
        medicalConditions: col(row, "medical_history"),
        additionalNotes: col(row, "patient_context"),
      }

      const rowErrors = Object.values(validatePatient(patient))
      if (patient.dob && !/^\d{4}-\d{2}-\d{2}$/.test(patient.dob)) {
        rowErrors.push("Date of birth must be in YYYY-MM-DD format")
      } else if (patient.dob && Number.isNaN(new Date(patient.dob).getTime())) {
        rowErrors.push("Date of birth is not a valid date")
      }
      if (patient.gender && !GENDERS.includes(patient.gender)) {
        rowErrors.push(`Invalid gender "${rawGender}" (expected ${GENDERS.join(", ")})`)
      }
      if (patient.callType && !CALL_TYPES.includes(patient.callType)) {
        rowErrors.push(`Invalid call type "${rawCallType}"`)
      }
      const phoneDigits = digitsOnly(patient.phoneNumber)
      if (phoneDigits && seenPhones.has(phoneDigits)) {
        rowErrors.push("Duplicate phone number (already in the call list or earlier in the file)")
      }

      if (rowErrors.length > 0) {
        errors.push(`Row ${rowNumber}: ${rowErrors.join("; ")}`)
      } else {
        seenPhones.add(phoneDigits)
        validPatients.push(patient)
      }
    })

    setUploadErrors(errors)
    if (validPatients.length > 0) {
      onUpdate({ patients: [...data.patients, ...validPatients] })
    }
    toast({
      title: "CSV processed",
      description: `${validPatients.length} patient(s) added, ${errors.length} row(s) skipped.`,
      variant: errors.length > 0 ? "destructive" : "default",
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // Reset so selecting the same file again re-triggers onChange
    event.target.value = ""
    if (!file) return

    if (file.size > MAX_CSV_BYTES) {
      setUploadErrors(["File is too large (max 1 MB)"])
      return
    }

    const reader = new FileReader()
    reader.onload = () => processCsv(String(reader.result ?? ""))
    reader.onerror = () => setUploadErrors(["Could not read the file"])
    reader.readAsText(file)
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
                    className={validationErrors.name ? "border-destructive" : ""}
                  />
                  {validationErrors.name && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.name}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={currentPatient.dob}
                    onChange={(e) => setCurrentPatient(prev => ({ ...prev, dob: e.target.value }))}
                    className={validationErrors.dob ? "border-destructive" : ""}
                  />
                  {validationErrors.dob && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.dob}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={currentPatient.gender} onValueChange={(value) => setCurrentPatient(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger className={validationErrors.gender ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.gender && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.gender}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone number *</Label>
                  <Input
                    id="phoneNumber"
                    value={currentPatient.phoneNumber}
                    onChange={(e) => setCurrentPatient(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="(555) 123-4567"
                    className={validationErrors.phoneNumber ? "border-destructive" : ""}
                  />
                  {validationErrors.phoneNumber && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.phoneNumber}
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="callType">Call type *</Label>
                  <Select value={currentPatient.callType} onValueChange={(value) => setCurrentPatient(prev => ({ ...prev, callType: value }))}>
                    <SelectTrigger className={validationErrors.callType ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select call type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CALL_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.callType && (
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.callType}
                    </div>
                  )}
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
                disabled={!currentPatient.name || !currentPatient.dob || !currentPatient.gender || !currentPatient.phoneNumber || !currentPatient.callType || isCheckingDuplicate}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCheckingDuplicate ? "Checking for duplicates..." : "Add patient"}
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
                  <p className="text-xs text-muted-foreground">
                    Header row required. Columns: <code>{CSV_REQUIRED_COLUMNS.join(", ")}</code>
                    {" "}(required), <code>{CSV_OPTIONAL_COLUMNS.join(", ")}</code> (optional).
                  </p>
                  <div className="flex justify-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      Select CSV File
                    </Button>
                  </div>
                </div>
              </div>

              {uploadErrors.length > 0 && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-destructive">Upload issues found:</h4>
                    <Button variant="ghost" size="sm" onClick={() => setUploadErrors([])}>
                      <X className="h-4 w-4 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                  <ul className="space-y-1">
                    {uploadErrors.map((error, index) => (
                      <li key={index} className="text-sm text-destructive">• {error}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">
                    Rows with issues were not added. Fix them and re-upload the corrected rows, or dismiss to continue without them.
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