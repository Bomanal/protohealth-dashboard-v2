import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ProtocolData } from "../CreateProtocolWizard"
import { ArrowLeft, ArrowRight, Filter, BarChart3, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface VisualizeProtocolStepProps {
  data: ProtocolData
  onNext: () => void
  onBack: () => void
}

const mockSymptoms = ["Chest Pain", "Shortness of Breath", "Dizziness", "Palpitations", "Fatigue"]
const mockDiagnoses = ["Angina", "Myocardial Infarction", "Arrhythmia", "Heart Failure", "Anxiety"]
const mockEndpoints = ["Emergency Referral", "Cardiology Consult", "GP Follow-up", "Self-Care", "Pharmacy Referral"]

export function VisualizeProtocolStep({ data, onNext, onBack }: VisualizeProtocolStepProps) {
  const [filters, setFilters] = useState({
    symptoms: [] as string[],
    diagnoses: [] as string[],
    endpoints: [] as string[]
  })

  const handleFilterChange = (type: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value) 
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }))
  }

  const clearFilters = () => {
    setFilters({ symptoms: [], diagnoses: [], endpoints: [] })
  }

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0)

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Protocol Visualization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filter Controls */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter Protocol Graph
                </h3>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Symptom Filter */}
                <div className="space-y-2">
                  <Label>Filter by Symptom</Label>
                  <Select onValueChange={(value) => handleFilterChange('symptoms', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select symptoms..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockSymptoms.map((symptom) => (
                        <SelectItem key={symptom} value={symptom}>{symptom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-1">
                    {filters.symptoms.map((symptom) => (
                      <Badge key={symptom} variant="secondary" className="text-xs">
                        {symptom}
                        <button
                          className="ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() => handleFilterChange('symptoms', symptom)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Diagnosis Filter */}
                <div className="space-y-2">
                  <Label>Filter by Diagnosis</Label>
                  <Select onValueChange={(value) => handleFilterChange('diagnoses', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select diagnoses..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDiagnoses.map((diagnosis) => (
                        <SelectItem key={diagnosis} value={diagnosis}>{diagnosis}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-1">
                    {filters.diagnoses.map((diagnosis) => (
                      <Badge key={diagnosis} variant="secondary" className="text-xs">
                        {diagnosis}
                        <button
                          className="ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() => handleFilterChange('diagnoses', diagnosis)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Endpoint Filter */}
                <div className="space-y-2">
                  <Label>Filter by Endpoint</Label>
                  <Select onValueChange={(value) => handleFilterChange('endpoints', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select endpoints..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockEndpoints.map((endpoint) => (
                        <SelectItem key={endpoint} value={endpoint}>{endpoint}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-1">
                    {filters.endpoints.map((endpoint) => (
                      <Badge key={endpoint} variant="secondary" className="text-xs">
                        {endpoint}
                        <button
                          className="ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() => handleFilterChange('endpoints', endpoint)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Protocol Graph Placeholder */}
          <Card>
            <CardContent className="p-8">
              <div className="h-96 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Protocol Decision Tree</h3>
                  <p className="text-muted-foreground mb-4">
                    Interactive protocol visualization will be displayed here
                  </p>
                  {hasActiveFilters && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Active filters:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[...filters.symptoms, ...filters.diagnoses, ...filters.endpoints].map((filter) => (
                          <Badge key={filter} variant="outline">{filter}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={onNext}>
              Continue to Simulations
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}