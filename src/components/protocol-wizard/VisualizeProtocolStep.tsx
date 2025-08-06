import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtocolData } from "../CreateProtocolWizard"
import { ArrowLeft, Check, BarChart3, Loader2, Maximize2, Minimize2, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useProtocols } from "@/hooks/useProtocols"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

export function VisualizeProtocolStep({ data, onNext, onBack }: VisualizeProtocolStepProps) {
  const { protocols, loading, error } = useProtocols();
  const [selectedProtocol, setSelectedProtocol] = useState<string>(data.name || "Current Protocol")
  const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(null)
  const [tableData, setTableData] = useState<ProtocolTableData | null>(null);
  const [loadingTableData, setLoadingTableData] = useState(false);
  const [acceptanceStatus, setAcceptanceStatus] = useState<{ [thread_id: string]: boolean }>({});
  const [pendingNodeChanges, setPendingNodeChanges] = useState<{[key: string]: string}>({});
  const [pendingAcceptanceChanges, setPendingAcceptanceChanges] = useState<{[thread_id: string]: boolean}>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (selectedProtocolId) {
      fetchTableData(selectedProtocolId);
    }
  }, [selectedProtocolId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  const updateCellValue = (threadId: string, nodeId: string, newValue: string) => {
    const key = `${threadId}-${nodeId}`;
    
    // Update local state immediately
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
    
    // Track the change as pending - INCLUDING EMPTY STRINGS
    setPendingNodeChanges(prev => ({
      ...prev,
      [key]: newValue  // This should include "" (empty string)
    }));
  };

  const fetchTableData = async (protocolId: string) => {
    if (!protocolId) return;
    
    setLoadingTableData(true);
    try {
      const response = await fetch(`/protocol/${protocolId}/table-data`);
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
    const newAcceptanceValue = !acceptanceStatus[threadId];
    
    // Update local state immediately
    setAcceptanceStatus(prev => ({
      ...prev,
      [threadId]: newAcceptanceValue
    }));
    
    // Track the change as pending
    setPendingAcceptanceChanges(prev => ({
      ...prev,
      [threadId]: newAcceptanceValue
    }));
  };

  const saveAllChanges = async () => {
    if (!selectedProtocolId) return;
    
    setIsSaving(true);
    
    try {
      // Prepare node updates
      const nodeUpdates = Object.entries(pendingNodeChanges).map(([key, value]) => {
        const [thread_id, node_id] = key.split('-');
        return { thread_id, node_id, node_value: value }; // This should include empty strings
      });
      
      // Prepare acceptance updates
      const acceptanceUpdates = Object.entries(pendingAcceptanceChanges).map(([thread_id, acceptance]) => ({
        thread_id,
        acceptance
      }));
      
      // Send batch update
      const response = await fetch(`/protocol/${selectedProtocolId}/batch-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          node_updates: nodeUpdates,
          acceptance_updates: acceptanceUpdates
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('All changes saved:', result);
        
        // Clear pending changes
        setPendingNodeChanges({});
        setPendingAcceptanceChanges({});
      } else {
        console.error('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProtocolChange = (protocolId: string) => {  // ✅ Receive protocol_id
    const selectedProtocolData = protocols.find(p => p.protocol_id === protocolId)
    if (selectedProtocolData) {
      setSelectedProtocol(selectedProtocolData.protocol_name)  // ✅ Set display name
      setSelectedProtocolId(protocolId)  // ✅ Set the ID for API calls
      // clearFilters() // Removed as per edit hint
      // fetchFinalOutcomes(protocolId) // Removed as per edit hint
    }
  }

  const hasUnsavedChanges = () => {
    return Object.keys(pendingNodeChanges).length > 0 || Object.keys(pendingAcceptanceChanges).length > 0;
  };

  const getTotalPendingChanges = () => {
    return Object.keys(pendingNodeChanges).length + Object.keys(pendingAcceptanceChanges).length;
  };

  const handleReviewAndSave = () => {
    setShowConfirmDialog(true);
  };

  const confirmSave = () => {
    setShowConfirmDialog(false);
    onNext();
  };

  return (
    <div className="max-w-6xl mx-auto">
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsFullscreen(false)} />
      )}

      <Card className={isFullscreen ? "fixed inset-4 z-50 rounded-lg shadow-2xl" : "border-border/50 bg-card/80 backdrop-blur-sm"}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Protocol Data Visualization
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="protocol-select" className="text-sm font-medium">Protocol:</Label>
              <Select value={selectedProtocolId || ""} onValueChange={handleProtocolChange} disabled={loading}>
                <SelectTrigger className="w-64" id="protocol-select">
                  <SelectValue placeholder={loading ? "Loading protocols..." : "Select a protocol"} />
                  {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
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
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Protocol Data Table */}
          <Card className={isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}>
            <CardContent className={isFullscreen ? "p-6 h-full flex flex-col" : "p-6"}>
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
                <div className={isFullscreen ? "flex flex-col h-full space-y-4" : "space-y-4"}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Protocol Data Matrix</h3>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {tableData.threads.length} threads × {Object.keys(tableData.questions).length} questions
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="flex items-center gap-2"
                      >
                        {isFullscreen ? (
                          <>
                            <Minimize2 className="h-4 w-4" />
                            Exit Fullscreen
                          </>
                        ) : (
                          <>
                            <Maximize2 className="h-4 w-4" />
                            Fullscreen
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className={`border rounded-lg overflow-hidden ${isFullscreen ? "flex-1" : ""}`}>
                    <div className={`overflow-auto ${isFullscreen ? "h-full" : "h-96"}`}>
                      <Table>
                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                          <TableRow>
                            <TableHead className="sticky left-0 bg-muted/50 border-r-2 border-border min-w-72 max-w-72 z-20">
                              <div className="font-semibold">Final Condition</div>
                              <div className="text-xs text-muted-foreground font-normal">Thread ID</div>
                            </TableHead>
                            {Object.entries(tableData.questions).map(([nodeId, question]) => (
                              <TableHead key={nodeId} className="min-w-56 max-w-56 bg-muted/50">
                                <div className="text-xs break-words">{question}</div>
                                <div className="text-xs text-muted-foreground font-normal mt-1">({nodeId})</div>
                              </TableHead>
                            ))}
                            <TableHead className="min-w-36 max-w-36 bg-muted/50">
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
                                <TableCell key={nodeId} className="min-w-56 max-w-56 p-3">
                                  <Input
                                    value={thread.values[nodeId] || ''}
                                    onChange={(e) => {
                                      updateCellValue(thread.thread_id, nodeId, e.target.value);
                                    }}
                                    placeholder="No value"
                                    className={`text-sm h-12 ${pendingNodeChanges[`${thread.thread_id}-${nodeId}`] !== undefined ? 'border-orange-300 bg-orange-50' : ''}`}
                                  />
                                </TableCell>
                              ))}
                              <TableCell className="min-w-36 max-w-36 p-3">
                                <Button
                                  variant={acceptanceStatus[thread.thread_id] ? "default" : "destructive"}
                                  size="sm"
                                  onClick={() => toggleAcceptance(thread.thread_id)}
                                  className={`w-full text-sm h-12 ${pendingAcceptanceChanges[thread.thread_id] !== undefined ? 'border-2 border-orange-400' : ''}`}
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
                  
                  {hasUnsavedChanges() && (
                    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-orange-800">
                          <strong>{getTotalPendingChanges()} unsaved changes</strong>
                          <p className="text-xs text-orange-600 mt-1">
                            Changes are highlighted in orange. Click "Save All Changes" to persist them to the database.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPendingNodeChanges({});
                              setPendingAcceptanceChanges({});
                              // Refresh table data to revert changes
                              if (selectedProtocolId) {
                                fetchTableData(selectedProtocolId);
                              }
                            }}
                            disabled={isSaving}
                          >
                            Discard Changes
                          </Button>
                          <Button
                            onClick={saveAllChanges}
                            disabled={isSaving}
                            className="flex items-center gap-2"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                Save All Changes
                              </>
                            )}
                          </Button>
                        </div>
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
            <Button onClick={handleReviewAndSave}>
              <Check className="h-4 w-4 mr-2" />
              Review and Save
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review and Save Protocol</DialogTitle>
            <DialogDescription>
              Are you sure you want to save "{data.name}" protocol? This will create a new protocol that can be used for patient triage.
              <br /><br />
              <span className="text-sm text-muted-foreground">
                Note: Steps 4 and 5 (Review Simulations and Run Simulations) will be available in a future update.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSave}>
              <Check className="h-4 w-4 mr-2" />
              Save Protocol
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}