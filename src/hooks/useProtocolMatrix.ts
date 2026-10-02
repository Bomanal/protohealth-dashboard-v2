import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { protocolService, type MatrixEdit } from "@/hooks/useProtocolEngine"

/** Shape returned by GET /protocol/{id}/table-data (src/api/create_protocol.py). */
export interface ProtocolThreadRow {
  thread_id: string
  final_condition: string | null
  triage_outcome: string | null
  /** emergency | urgent | routine | self_care */
  urgency: string | null
  /** true = accepted, false = rejected, null = not yet reviewed */
  acceptance: boolean | null
  values: Record<string, string>
}

export interface ProtocolTableData {
  protocol_id: string
  /** DRAFT / APPROVED, projected from the protocol service */
  status: string | null
  version: number | null
  version_id: string | null
  questions: Record<string, string> // node_id -> question
  threads: ProtocolThreadRow[]
}

interface PendingNodeChange {
  thread_id: string
  node_id: string
  node_value: string
}

export interface SaveOutcome {
  ok: boolean
  saved: number
  failed: number
  message?: string
}

export const nodeKey = (threadId: string, nodeId: string) => `${threadId}::${nodeId}`
export const acceptanceKey = (threadId: string) => `acceptance::${threadId}`

/**
 * Loads a protocol's thread x question matrix and tracks unsaved edits.
 * Shared by the Visualize Protocol page and the Create Protocol wizard step.
 */
export function useProtocolMatrix(protocolId: string | null) {
  const [tableData, setTableData] = useState<ProtocolTableData | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [pendingNodeChanges, setPendingNodeChanges] = useState<Record<string, PendingNodeChange>>({})
  const [pendingAcceptanceChanges, setPendingAcceptanceChanges] = useState<Record<string, boolean>>({})
  // Per-item save errors keyed by nodeKey()/acceptanceKey()
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const requestIdRef = useRef(0)

  const resetPending = useCallback(() => {
    setPendingNodeChanges({})
    setPendingAcceptanceChanges({})
    setItemErrors({})
  }, [])

  const reload = useCallback(async () => {
    if (!protocolId) {
      setTableData(null)
      return
    }
    const requestId = ++requestIdRef.current
    setLoading(true)
    setLoadError(null)
    try {
      const response = await fetch(`/protocol/${encodeURIComponent(protocolId)}/table-data`)
      if (response.status === 404) {
        if (requestId === requestIdRef.current) setTableData(null)
        return
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch table data (HTTP ${response.status})`)
      }
      const data = (await response.json()) as ProtocolTableData
      if (requestId !== requestIdRef.current) return
      setTableData({
        ...data,
        threads: data.threads.map(t => ({
          ...t, acceptance: t.acceptance ?? null, urgency: t.urgency ?? null, values: t.values ?? {},
        })),
      })
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      setTableData(null)
      setLoadError(err instanceof Error ? err.message : "Failed to fetch table data")
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [protocolId])

  // Switching protocols discards pending edits for the previous one
  useEffect(() => {
    resetPending()
    reload()
  }, [reload, resetPending])

  const updateCell = useCallback((threadId: string, nodeId: string, value: string) => {
    setTableData(prev => prev && {
      ...prev,
      threads: prev.threads.map(t =>
        t.thread_id === threadId ? { ...t, values: { ...t.values, [nodeId]: value } } : t
      ),
    })
    const key = nodeKey(threadId, nodeId)
    // Empty strings are intentional edits and must be saved too
    setPendingNodeChanges(prev => ({ ...prev, [key]: { thread_id: threadId, node_id: nodeId, node_value: value } }))
    setItemErrors(prev => {
      if (!(key in prev)) return prev
      const { [key]: _removed, ...rest } = prev
      return rest
    })
  }, [])

  const effectiveAcceptance = useCallback(
    (thread: ProtocolThreadRow): boolean | null =>
      thread.thread_id in pendingAcceptanceChanges ? pendingAcceptanceChanges[thread.thread_id] : thread.acceptance,
    [pendingAcceptanceChanges]
  )

  const toggleAcceptance = useCallback((thread: ProtocolThreadRow) => {
    const current = thread.thread_id in pendingAcceptanceChanges
      ? pendingAcceptanceChanges[thread.thread_id]
      : thread.acceptance
    // Unreviewed -> Accept -> Reject -> Accept ...
    const next = current !== true
    setPendingAcceptanceChanges(prev => {
      // Toggling back to the stored value removes the pending change
      if (next === thread.acceptance) {
        const { [thread.thread_id]: _removed, ...rest } = prev
        return rest
      }
      return { ...prev, [thread.thread_id]: next }
    })
    const key = acceptanceKey(thread.thread_id)
    setItemErrors(prev => {
      if (!(key in prev)) return prev
      const { [key]: _removed, ...rest } = prev
      return rest
    })
  }, [pendingAcceptanceChanges])

  const pendingCount = Object.keys(pendingNodeChanges).length + Object.keys(pendingAcceptanceChanges).length

  /** Save pending edits as a new draft version (protocol service); the matrix is re-projected and reloaded. */
  const save = useCallback(async (): Promise<SaveOutcome> => {
    if (!protocolId) return { ok: false, saved: 0, failed: 0, message: "No protocol selected" }
    const edits: MatrixEdit[] = [
      ...Object.values(pendingNodeChanges).map(u => ({
        op: "set_finding" as const, thread_id: u.thread_id, node_id: u.node_id, value: u.node_value.trim(),
      })),
      // Accept = reviewed (needs_review false); Reject keeps the thread flagged for review
      ...Object.entries(pendingAcceptanceChanges).map(([thread_id, acceptance]) => ({
        op: "set_thread" as const, thread_id, field: "needs_review" as const, value: !acceptance,
      })),
    ]
    if (edits.length === 0) return { ok: true, saved: 0, failed: 0 }
    setIsSaving(true)
    try {
      await protocolService.saveDraft(protocolId, edits)
      resetPending()
      await reload()
      return { ok: true, saved: edits.length, failed: 0 }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed"
      return { ok: false, saved: 0, failed: edits.length, message: `${message}. No changes were saved.` }
    } finally {
      setIsSaving(false)
    }
  }, [protocolId, pendingNodeChanges, pendingAcceptanceChanges, reload, resetPending])

  const discard = useCallback(() => {
    resetPending()
    reload()
  }, [reload, resetPending])

  const questionIds = useMemo(() => (tableData ? Object.keys(tableData.questions) : []), [tableData])

  return {
    tableData,
    questionIds,
    loading,
    loadError,
    reload,
    pendingNodeChanges,
    pendingAcceptanceChanges,
    itemErrors,
    pendingCount,
    isSaving,
    updateCell,
    toggleAcceptance,
    effectiveAcceptance,
    save,
    discard,
  }
}
