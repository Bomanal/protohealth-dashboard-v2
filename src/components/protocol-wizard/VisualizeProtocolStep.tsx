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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useState as useTableState, useEffect as useTableEffect } from "react"

interface VisualizeProtocolStepProps {
  data: ProtocolData
  onNext: () => void
  onBack: () => void
}

interface ProtocolTableData {
  protocol_id: string;
  questions: { [node_id: string]: string };
  threads: Array<{
    thread_id: string;
    final_condition: string;
    triage_outcome: string;
    values: { [node_id: string]: string };
    acceptance?: boolean; // Add this optional field
  }>;
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

  const [tableData, setTableData] = useTableState<ProtocolTableData | null>(null);
  const [loadingTableData, setLoadingTableData] = useTableState(false);
  const [acceptanceStatus, setAcceptanceStatus] = useState<{ [thread_id: string]: boolean }>({});

  useTableEffect(() => {
    if (selectedProtocolId) {
      fetchTableData(selectedProtocolId);
    }
  }, [selectedProtocolId]);

  const updateCellValue = async (threadId: string, nodeId: string, newValue: string) => {
    if (!selectedProtocolId || !tableData) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/protocol/${selectedProtocolId}/update-thread-node`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thread_id: threadId,
          node_id: nodeId,
          node_value: newValue
        })
      });

      if (response.ok) {
        // Update local state
        setTableData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            threads: prev.threads.map(thread => 
              thread.thread_id === threadId 
                ? { ...thread, values: { ...thread.values, [nodeId]: newValue } }
                : thread
            )
          };
        });
      }
    } catch (error) {
      console.error('Error updating cell:', error);
    }
  };

  const fetchTableData = async (protocolId: string) => {
    if (!protocolId) return;
    
    setLoadingTableData(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/protocol/${protocolId}/table-data`);
      if (!response.ok) {
        throw new Error(`Failed to fetch table data: ${response.status}`);
      }
      const data = await response.json();
      setTableData(data);
      
      // Initialize all threads to "Accept" by default
      const initialAcceptance: { [thread_id: string]: boolean } = {};
      data.threads.forEach((thread: any) => {
        initialAcceptance[thread.thread_id] = true; // Default to Accept
      });
      setAcceptanceStatus(initialAcceptance);
      
      console.log('Table data loaded:', data);
    } catch (err) {
      console.error('Error fetching table data:', err);
      setTableData(null);
    } finally {
      setLoadingTableData(false);
    }
  };

  const toggleAcceptance = (threadId: string) => {
    setAcceptanceStatus(prev => ({
      ...prev,
      [threadId]: !prev[threadId]
    }));
  };

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

  const handleProtocolChange = (protocolId: string) => {  // ✅ Receive protocol_id
    const selectedProtocolData = protocols.find(p => p.protocol_id === protocolId)
    if (selectedProtocolData) {
      setSelectedProtocol(selectedProtocolData.protocol_name)  // ✅ Set display name
      setSelectedProtocolId(protocolId)  // ✅ Set the ID for API calls
      setShowProtocolSelector(false)
      clearFilters()
      fetchFinalOutcomes(protocolId)  // ✅ Use the actual protocol_id
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
                      <SelectItem key={protocol.protocol_id} value={protocol.protocol_id}>  {/* ✅ Pass protocol_id as value */}
                        {protocol.protocol_name}  {/* ✅ Show protocol_name to user */}
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

          {/* Protocol Data Table */}
          <Card>
            <CardContent className="p-6">
              {loadingTableData ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
                    <h3 className="text-xl font-semibold mb-2">Loading Protocol Data</h3>
                    <p className="text-muted-foreground">Fetching thread data...</p>
                  </div>
                </div>
              ) : !tableData ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
                    <p className="text-muted-foreground">
                      {selectedProtocolId ? 'No thread data found for this protocol' : 'Please select a protocol first'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Protocol Data Matrix</h3>
                    <div className="text-sm text-muted-foreground">
                      {tableData.threads.length} threads × {Object.keys(tableData.questions).length} questions
                    </div>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-96">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead className="sticky left-0 bg-muted/50 border-r-2 border-border min-w-64 max-w-64">
                              <div className="font-semibold">Final Condition</div>
                              <div className="text-xs text-muted-foreground font-normal">Thread ID</div>
                            </TableHead>
                            {Object.entries(tableData.questions).map(([nodeId, question]) => (
                              <TableHead key={nodeId} className="min-w-48 max-w-48">
                                <div className="text-xs break-words">{question}</div>
                                <div className="text-xs text-muted-foreground font-normal mt-1">({nodeId})</div>
                              </TableHead>
                            ))}
                            <TableHead className="min-w-32 max-w-32">
                              <div className="font-semibold text-center">Accept/Reject</div>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableData.threads.map((thread) => (
                            <TableRow key={thread.thread_id} className="hover:bg-muted/20">
                              <TableCell className="sticky left-0 bg-background border-r-2 border-border min-w-64 max-w-64">
                                <div className="space-y-1">
                                  <div className="font-medium text-sm break-words">
                                    {thread.final_condition || 'No condition specified'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {thread.thread_id}
                                  </div>
                                  <div className="text-xs text-blue-600 break-words">
                                    {thread.triage_outcome}
                                  </div>
                                </div>
                              </TableCell>
                              {Object.keys(tableData.questions).map((nodeId) => (
                                <TableCell key={nodeId} className="min-w-48 max-w-48 p-2">
                                  <Input
                                    value={thread.values[nodeId] || ''}
                                    onChange={(e) => {
                                      // Update local state immediately for responsiveness
                                      setTableData(prev => {
                                        if (!prev) return prev;
                                        return {
                                          ...prev,
                                          threads: prev.threads.map(t => 
                                            t.thread_id === thread.thread_id 
                                              ? { ...t, values: { ...t.values, [nodeId]: e.target.value } }
                                              : t
                                          )
                                        };
                                      });
                                    }}
                                    onBlur={(e) => {
                                      // Save to backend on blur
                                      updateCellValue(thread.thread_id, nodeId, e.target.value);
                                    }}
                                    placeholder="No value"
                                    className="text-xs h-8"
                                  />
                                </TableCell>
                              ))}
                              <TableCell className="min-w-32 max-w-32 p-2">
                                <Button
                                  variant={acceptanceStatus[thread.thread_id] ? "default" : "destructive"}
                                  size="sm"
                                  onClick={() => toggleAcceptance(thread.thread_id)}
                                  className="w-full text-xs h-8"
                                >
                                  {acceptanceStatus[thread.thread_id] ? "Accept" : "Reject"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  {hasActiveFilters && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Active filters:</p>
                      <div className="flex flex-wrap gap-2">
                        {[...filters.diagnoses, ...filters.endpoints].map((filter) => (
                          <Badge key={filter} variant="outline" className="text-xs">{filter}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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