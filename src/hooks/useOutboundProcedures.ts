import { useEffect, useState } from "react"
import { protocolService } from "@/hooks/useProtocolEngine"

export interface ProcedureOption {
  /** protocol store procedure_type, stored as the call's Procedure */
  value: string
  label: string
  /** an approved version is live (otherwise calls run the latest draft, development only) */
  live: boolean
}

/** Outbound procedures that have a call protocol in the protocol store. */
export function useOutboundProcedures() {
  const [procedures, setProcedures] = useState<ProcedureOption[]>([])
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    protocolService.list("outbound")
      .then(list => setProcedures(list
        .filter(p => p.procedure_type && (p.active_version || p.latest_version?.status === "draft"))
        .map(p => ({ value: p.procedure_type as string, label: p.title || p.procedure_type || p.name, live: !!p.active_version }))))
      .catch(err => setError(err instanceof Error ? err.message : "Could not load procedures"))
  }, [])
  return { procedures, error }
}

/** Match a CSV / free-text value to a procedure (by procedure_type or title, case-insensitive). */
export function matchProcedure(procedures: ProcedureOption[], raw: string): ProcedureOption | undefined {
  const key = raw.trim().toLowerCase().replace(/[\s-]+/g, "_")
  return procedures.find(p => p.value === key || p.label.toLowerCase() === raw.trim().toLowerCase())
}
