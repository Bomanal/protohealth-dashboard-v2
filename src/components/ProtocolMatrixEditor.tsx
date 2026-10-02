import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, BarChart3, Loader2, Maximize2, Minimize2, Save, AlertTriangle } from "lucide-react"
import { useProtocols } from "@/hooks/useProtocols"
import { useProtocolMatrix, nodeKey, acceptanceKey } from "@/hooks/useProtocolMatrix"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { ProtocolApprovalBar } from "@/components/protocol-wizard/ProtocolApprovalBar"

const URGENCY_STYLE: Record<string, string> = {
  emergency: "bg-red-100 text-red-800 border-red-200",
  urgent: "bg-orange-100 text-orange-800 border-orange-200",
  routine: "bg-blue-100 text-blue-800 border-blue-200",
  self_care: "bg-green-100 text-green-800 border-green-200",
}

interface ProtocolOption {
  protocol_id: string
  protocol_name: string
  protocol_description: string
}

interface ProtocolMatrixEditorProps {
  /** Pick the protocol to select once the protocol list loads (return undefined for none). */
  autoSelect?: (protocols: ProtocolOption[]) => string | undefined
  /** Called after a version is approved (made live). */
  onApproved?: () => void
  onBack: () => void
  /** Called after the user confirms "Review and Save" and all pending changes saved successfully. */
  onConfirm?: () => void
  /** Text for the confirmation dialog; receives the selected protocol's name. */
  confirmDescription?: (protocolName: string) => string
}

/**
 * Thread x question matrix for a triage protocol with inline editing and
 * accept/reject per thread. Used by the Visualize Protocol page and the
 * Create Protocol wizard.
 */
export function ProtocolMatrixEditor({ autoSelect, onBack, onConfirm, confirmDescription, onApproved }: ProtocolMatrixEditorProps) {
  const { toast } = useToast()
  const { protocols, loading: loadingProtocols, error: protocolsError } = useProtocols()
  const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [savedCount, setSavedCount] = useState(0) // bumps the approval bar after each save

  const matrix = useProtocolMatrix(selectedProtocolId)
  const { tableData, questionIds } = matrix
  const selectedProtocolName = protocols.find(p => p.protocol_id === selectedProtocolId)?.protocol_name ?? "this"

  // Auto-select once protocols are loaded
  useEffect(() => {
    if (selectedProtocolId || protocols.length === 0 || !autoSelect) return
    const id = autoSelect(protocols)
    if (id) setSelectedProtocolId(id)
  }, [protocols, autoSelect, selectedProtocolId])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false)
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isFullscreen])

  const handleSave = async (): Promise<boolean> => {
    const outcome = await matrix.save()
    if (outcome.ok) {
      if (outcome.saved > 0) {
        setSavedCount(c => c + 1)
        toast({ title: "Draft saved", description: `${outcome.saved} change(s) saved as a new draft version. Approve it to make it live.` })
      }
      return true
    }
    toast({
      title: outcome.saved > 0 ? "Some changes were not saved" : "Save failed",
      description: outcome.message ?? "Please try again.",
      variant: "destructive",
    })
    return false
  }

  const confirmSave = async () => {
    const ok = await handleSave()
    if (!ok) return
    setShowConfirmDialog(false)
    onConfirm?.()
  }

  const errorCount = Object.keys(matrix.itemErrors).length

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
              <Select
                value={selectedProtocolId || ""}
                onValueChange={setSelectedProtocolId}
                disabled={loadingProtocols || matrix.isSaving}
              >
                <SelectTrigger className="w-64" id="protocol-select">
                  <SelectValue placeholder={loadingProtocols ? "Loading protocols..." : "Select a protocol"} />
                  {loadingProtocols && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                </SelectTrigger>
                <SelectContent>
                  {protocolsError ? (
                    <div className="p-2 text-sm text-destructive">
                      Error loading protocols: {protocolsError}
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
          <ProtocolApprovalBar
            protocolId={selectedProtocolId}
            refreshKey={savedCount}
            pendingChanges={matrix.pendingCount}
            onApproved={() => { matrix.reload(); onApproved?.() }}
          />
          <Card className={isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}>
            <CardContent className={isFullscreen ? "p-6 h-full flex flex-col" : "p-6"}>
              {matrix.loading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
                    <h3 className="text-xl font-semibold mb-2">Loading Protocol Data</h3>
                    <p className="text-muted-foreground">Fetching thread data...</p>
                  </div>
                </div>
              ) : matrix.loadError ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Couldn't load protocol data</h3>
                    <p className="text-muted-foreground mb-4">{matrix.loadError}</p>
                    <Button variant="outline" onClick={() => matrix.reload()}>Retry</Button>
                  </div>
                </div>
              ) : !tableData ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
                    <p className="text-muted-foreground">
                      {selectedProtocolId ? "No thread data found for this protocol" : "Please select a protocol first"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className={isFullscreen ? "flex flex-col h-full space-y-4" : "space-y-4"}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Protocol Data Matrix</h3>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {tableData.threads.length} threads × {questionIds.length} questions
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
                            {questionIds.map((nodeId) => (
                              <TableHead key={nodeId} className="min-w-56 max-w-56 bg-muted/50">
                                <div className="text-xs break-words">{tableData.questions[nodeId]}</div>
                                <div className="text-xs text-muted-foreground font-normal mt-1">({nodeId})</div>
                              </TableHead>
                            ))}
                            <TableHead className="min-w-36 max-w-36 bg-muted/50">
                              <div className="font-semibold text-center">Clinician review</div>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableData.threads.map((thread) => {
                            const acceptance = matrix.effectiveAcceptance(thread)
                            const accKey = acceptanceKey(thread.thread_id)
                            const accError = matrix.itemErrors[accKey]
                            const accPending = thread.thread_id in matrix.pendingAcceptanceChanges
                            return (
                              <TableRow key={thread.thread_id} className="hover:bg-muted/20">
                                <TableCell className="sticky left-0 bg-background border-r-2 border-border min-w-64 max-w-64">
                                  <div className="space-y-1">
                                    <div className="font-medium text-sm break-words">
                                      {thread.final_condition || "No condition specified"}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {thread.urgency && (
                                        <Badge variant="outline" className={`text-[10px] ${URGENCY_STYLE[thread.urgency] ?? ""}`}>
                                          {thread.urgency.replace("_", " ")}
                                        </Badge>
                                      )}
                                      <span className="text-xs text-muted-foreground">{thread.thread_id}</span>
                                    </div>
                                    <div className="text-xs text-blue-600 break-words">{thread.triage_outcome}</div>
                                  </div>
                                </TableCell>
                                {questionIds.map((nodeId) => {
                                  const key = nodeKey(thread.thread_id, nodeId)
                                  const cellError = matrix.itemErrors[key]
                                  const pending = key in matrix.pendingNodeChanges
                                  return (
                                    <TableCell key={nodeId} className="min-w-56 max-w-56 p-3">
                                      <Input
                                        value={thread.values[nodeId] || ""}
                                        onChange={(e) => matrix.updateCell(thread.thread_id, nodeId, e.target.value)}
                                        placeholder="No value"
                                        title={cellError}
                                        className={`text-sm h-12 ${cellError ? "border-destructive bg-destructive/10" : pending ? "border-orange-300 bg-orange-50" : ""}`}
                                      />
                                      {cellError && <p className="text-xs text-destructive mt-1">{cellError}</p>}
                                    </TableCell>
                                  )
                                })}
                                <TableCell className="min-w-36 max-w-36 p-3">
                                  <Button
                                    variant={acceptance === true ? "default" : acceptance === false ? "destructive" : "outline"}
                                    size="sm"
                                    onClick={() => matrix.toggleAcceptance(thread)}
                                    title={accError}
                                    className={`w-full text-sm h-12 ${accError ? "ring-2 ring-destructive" : accPending ? "border-2 border-orange-400" : ""}`}
                                  >
                                    {acceptance === true ? "Reviewed" : acceptance === false ? "Needs review" : "Not reviewed"}
                                  </Button>
                                  {accError && <p className="text-xs text-destructive mt-1">{accError}</p>}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {matrix.pendingCount > 0 && (
                    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-orange-800">
                          <strong>{matrix.pendingCount} unsaved changes</strong>
                          <p className="text-xs text-orange-600 mt-1">
                            Changes are highlighted in orange. Saving creates a new draft version; calls keep using the live version until it is approved.
                          </p>
                          {errorCount > 0 && (
                            <p className="text-xs text-destructive mt-1">
                              {errorCount} change(s) failed to save and are highlighted in red.
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={matrix.discard} disabled={matrix.isSaving}>
                            Discard Changes
                          </Button>
                          <Button onClick={handleSave} disabled={matrix.isSaving} className="flex items-center gap-2">
                            {matrix.isSaving ? (
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
            <Button onClick={() => setShowConfirmDialog(true)} disabled={!selectedProtocolId}>
              <Check className="h-4 w-4 mr-2" />
              Save and Finish
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review and Save Protocol</DialogTitle>
            <DialogDescription>
              {confirmDescription
                ? confirmDescription(selectedProtocolName)
                : `Save pending changes to "${selectedProtocolName}" as a draft? Calls use it only after it is approved.`}
              {matrix.pendingCount > 0 && (
                <>
                  <br /><br />
                  <span className="text-sm">{matrix.pendingCount} unsaved change(s) will be saved.</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={matrix.isSaving}>
              Cancel
            </Button>
            <Button onClick={confirmSave} disabled={matrix.isSaving}>
              {matrix.isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              Save Protocol
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
