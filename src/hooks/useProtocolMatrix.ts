import { useCallback, useEffect, useMemo, useRef, useState } from "react"

/** Shape returned by GET /protocol/{id}/table-data (src/api/create_protocol.py). */
export interface ProtocolThreadRow {
  thread_id: string
  final_condition: string | null
  triage_outcome: string | null
  /** true = accepted, false = rejected, null = not yet reviewed */
  acceptance: boolean | null
  values: Record<string, string>
}

export interface ProtocolTableData {
  protocol_id: string
  questions: Record<string, string> // node_id -> question
  threads: ProtocolThreadRow[]
}

interface PendingNodeChange {
  thread_id: string
  node_id: string
  node_value: string
}

interface BatchResultItem {
  type: "node_update" | "acceptance_update"
  error?: string
  data?: { thread_id?: string; node_id?: string }
  result?: { thread_id?: string; node_id?: string }
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
        threads: data.threads.map(t => ({ ...t, acceptance: t.acceptance ?? null, values: t.values ?? {} })),
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

  const save = useCallback(async (): Promise<SaveOutcome> => {
    if (!protocolId) return { ok: false, saved: 0, failed: 0, message: "No protocol selected" }
    const nodeUpdates = Object.values(pendingNodeChanges)
    const acceptanceUpdates = Object.entries(pendingAcceptanceChanges).map(([thread_id, acceptance]) => ({ thread_id, acceptance }))
    if (nodeUpdates.length + acceptanceUpdates.length === 0) return { ok: true, saved: 0, failed: 0 }

    setIsSaving(true)
    try {
      const response = await fetch(`/protocol/${encodeURIComponent(protocolId)}/batch-update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ node_updates: nodeUpdates, acceptance_updates: acceptanceUpdates }),
      })

      if (!response.ok) {
        let message = `Save failed (HTTP ${response.status}); no changes were saved`
        try {
          const body = await response.json()
          if (typeof body?.detail === "string") message = body.detail
        } catch {
          // ignore non-JSON body
        }
        return { ok: false, saved: 0, failed: nodeUpdates.length + acceptanceUpdates.length, message }
      }

      const body = await response.json()
      const results: BatchResultItem[] = Array.isArray(body?.batch_results) ? body.batch_results : []
      const failedNodeKeys = new Set<string>()
      const failedAcceptance = new Set<string>()
      const errors: Record<string, string> = {}
      for (const r of results) {
        if (!r.error) continue
        const threadId = r.data?.thread_id
        if (!threadId) continue
        if (r.type === "node_update" && r.data?.node_id) {
          const key = nodeKey(threadId, r.data.node_id)
          failedNodeKeys.add(key)
          errors[key] = r.error
        } else if (r.type === "acceptance_update") {
          failedAcceptance.add(threadId)
          errors[acceptanceKey(threadId)] = r.error
        }
      }

      // Only clear changes that were saved and haven't been edited again since the request was sent
      setPendingNodeChanges(prev => {
        const next = { ...prev }
        for (const u of nodeUpdates) {
          const key = nodeKey(u.thread_id, u.node_id)
          if (!failedNodeKeys.has(key) && next[key]?.node_value === u.node_value) delete next[key]
        }
        return next
      })
      setPendingAcceptanceChanges(prev => {
        const next = { ...prev }
        for (const u of acceptanceUpdates) {
          if (!failedAcceptance.has(u.thread_id) && next[u.thread_id] === u.acceptance) delete next[u.thread_id]
        }
        return next
      })
      // Saved acceptance values become the new baseline
      const savedAcceptance = new Map(
        acceptanceUpdates.filter(u => !failedAcceptance.has(u.thread_id)).map(u => [u.thread_id, u.acceptance])
      )
      if (savedAcceptance.size > 0) {
        setTableData(prev => prev && {
          ...prev,
          threads: prev.threads.map(t =>
            savedAcceptance.has(t.thread_id) ? { ...t, acceptance: savedAcceptance.get(t.thread_id)! } : t
          ),
        })
      }
      setItemErrors(errors)

      const failed = failedNodeKeys.size + failedAcceptance.size
      const saved = nodeUpdates.length + acceptanceUpdates.length - failed
      return {
        ok: failed === 0,
        saved,
        failed,
        message: failed > 0 ? `${failed} change(s) could not be saved and are still pending` : undefined,
      }
    } catch (err) {
      return {
        ok: false,
        saved: 0,
        failed: nodeUpdates.length + acceptanceUpdates.length,
        message: err instanceof Error ? err.message : "Save failed",
      }
    } finally {
      setIsSaving(false)
    }
  }, [protocolId, pendingNodeChanges, pendingAcceptanceChanges])

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
