import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ProtocolData } from "../CreateProtocolWizard"
import { ArrowLeft, ArrowRight, Filter, BarChart3, RefreshCw, ChevronDown, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useProtocols } from "@/hooks/useProtocols"
import { useFinalOutcomes } from "@/hooks/useFinalOutcomes"

interface VisualizeProtocolStepProps {
  data: ProtocolData
  onNext: () => void
  onBack: () => void
}

const mockSymptoms = ["Chest Pain", "Shortness of Breath", "Dizziness", "Palpitations", "Fatigue"]
const mockEndpoints = ["Emergency Referral", "Cardiology Consult", "GP Follow-up", "Self-Care", "Pharmacy Referral"]

export function VisualizeProtocolStep({ data, onNext, onBack }: VisualizeProtocolStepProps) {
  const { protocols, loading, error } = useProtocols();
  const { finalOutcomes, loading: loadingOutcomes, fetchFinalOutcomes } = useFinalOutcomes();
  
  const [filters, setFilters] = useState({
    diagnoses: [] as string[],
    endpoints: [] as string[]
  })
  const [selectedThreadIds, setSelectedThreadIds] = useState<string[]>([])
  const [selectedProtocol, setSelectedProtocol] = useState<string>(data.name || "Current Protocol")
  const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(null)
  const [showProtocolSelector, setShowProtocolSelector] = useState(false)

  const handleFilterChange = (type: keyof typeof filters, value: string) => {
    if (type === 'diagnoses') {
      // Handle final outcomes and their thread IDs
      const outcome = finalOutcomes.find(o => o.final_outcome === value)
      if (outcome) {
        const isAlreadySelected = filters.diagnoses.includes(value)
        
        if (isAlreadySelected) {
          // Remove outcome and its thread ID
          setFilters(prev => ({
            ...prev,
            diagnoses: prev.diagnoses.filter(item => item !== value)
          }))
          setSelectedThreadIds(prev => prev.filter(id => id !== outcome.thread_id))
        } else {
          // Add outcome and its thread ID
          setFilters(prev => ({
            ...prev,
            diagnoses: [...prev.diagnoses, value]
          }))
          setSelectedThreadIds(prev => [...prev, outcome.thread_id])
        }
      }
    } else {
      // Handle other filter types (endpoints) normally
      setFilters(prev => ({
        ...prev,
        [type]: prev[type].includes(value) 
          ? prev[type].filter(item => item !== value)
          : [...prev[type], value]
      }))
    }
  }

  const clearFilters = () => {
    setFilters({ diagnoses: [], endpoints: [] })
    setSelectedThreadIds([])
  }

  const handleProtocolChange = (protocolId: string) => {
    const selectedProtocolData = protocols.find(p => p.protocol_id === protocolId)
    if (selectedProtocolData) {
      setSelectedProtocol(selectedProtocolData.protocol_name)
      setSelectedProtocolId(protocolId)
      setShowProtocolSelector(false)
      clearFilters()
      
      // Fetch final outcomes for the selected protocol
      fetchFinalOutcomes(protocolId)
    }
  }

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0)

  const fetchThreadDetails = async () => {
    if (selectedThreadIds.length === 0) return
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/threads/details?thread_ids=${selectedThreadIds.join(',')}`)
      if (!response.ok) {
        throw new Error('Failed to fetch thread details')
      }
      const data = await response.json()
      console.log('Thread details:', data) // You can handle this data as needed
      return data
    } catch (err) {
      console.error('Error fetching thread details:', err)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Visualize your {selectedProtocol} protocol
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowProtocolSelector(!showProtocolSelector)}
              className="flex items-center gap-2"
              disabled={loading}
            >
              Change protocol
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CardTitle>
          {showProtocolSelector && (
            <div className="mt-4">
              <Select value={selectedProtocolId || ""} onValueChange={handleProtocolChange} disabled={loading}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder={loading ? "Loading protocols..." : "Select a protocol"} />
                </SelectTrigger>
                <SelectContent>
                  {error ? (
                    <div className="p-2 text-sm text-destructive">
                      Error loading protocols: {error}
                    </div>
                  ) : (
                    protocols.map((protocol) => (
                      <SelectItem key={protocol.protocol_id} value={protocol.protocol_id}>
                        {protocol.protocol_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Final Outcomes Filter */}
                <div className="space-y-2">
                  <Label>Filter by Final Outcome</Label>
                  <Select 
                    onValueChange={(value) => handleFilterChange('diagnoses', value)} 
                    disabled={loadingOutcomes || !selectedProtocolId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !selectedProtocolId 
                          ? "Select a protocol first..." 
                          : loadingOutcomes 
                            ? "Loading outcomes..." 
                            : "Select final outcomes..."
                      } />
                      {loadingOutcomes && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                    </SelectTrigger>
                    <SelectContent>
                      {finalOutcomes.map((outcome) => (
                        <SelectItem key={outcome.thread_id} value={outcome.final_outcome}>
                          {outcome.final_outcome}
                        </SelectItem>
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
                  <Label>Filter by Triage Outcome</Label>
                  <Select onValueChange={(value) => handleFilterChange('endpoints', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select triage outcomes..." />
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
                  {selectedProtocolId && (
                    <div className="text-sm text-muted-foreground mb-4 space-y-1">
                      <p>Protocol ID: {selectedProtocolId} | Final Outcomes: {finalOutcomes.length}</p>
                      <p>Selected Thread IDs: [{selectedThreadIds.join(', ')}]</p>
                    </div>
                  )}
                  {hasActiveFilters && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Active filters:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[...filters.diagnoses, ...filters.endpoints].map((filter) => (
                          <Badge key={filter} variant="outline">{filter}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedThreadIds.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchThreadDetails}
                      className="mt-2"
                    >
                      Fetch Thread Details ({selectedThreadIds.length} threads)
                    </Button>
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