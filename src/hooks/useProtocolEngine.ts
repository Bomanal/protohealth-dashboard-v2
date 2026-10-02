import { useCallback, useState } from 'react'

/**
 * Client for the backend protocol service (proxied by the dashboard API at /svc, see
 * src/api/protocol_service_proxy.py). The service owns upload -> generation -> draft versions -> approval;
 * calls only ever run an approved version.
 */

export type ProtocolKind = 'inbound' | 'outbound'
export type VersionStatus = 'processing' | 'failed' | 'draft' | 'approved' | 'archived'

export interface VersionSummary {
  version_id: string
  version: number
  status: VersionStatus
  created_at: string | null
  created_by: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  source_filename: string | null
  error: string | null
  validation_errors: string[] | null
}

export interface ProtocolSummary {
  protocol_id: string
  kind: ProtocolKind
  name: string
  title: string | null
  procedure_type: string | null
  active_version: VersionSummary | null
  latest_version: VersionSummary | null
}

export interface ProtocolDetail extends ProtocolSummary {
  versions: VersionSummary[]
  editable_version: VersionSummary | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bundle: Record<string, any> | null
}

export interface UploadInput {
  file: File
  kind: ProtocolKind
  name: string
  procedureType?: string
  createdBy?: string
}

export interface UploadResult {
  protocol_id: string
  version_id: string
  status: VersionStatus
}

export type MatrixEdit =
  | { op: 'set_finding'; thread_id: string; node_id: string; value: string }
  | { op: 'set_thread'; thread_id: string; field: 'urgency' | 'disposition' | 'home_care' | 'condition' | 'needs_review'; value: string | boolean }
  | { op: 'set_node'; node_id: string; field: 'name' | 'question' | 'category'; value: string }
  | { op: 'delete_thread'; thread_id: string }

/** Convert a non-OK response into an Error, tolerating non-JSON bodies. */
async function toError(response: Response, fallback: string): Promise<Error> {
  let detail: string | undefined
  try {
    const body = await response.json()
    if (typeof body?.detail === 'string') detail = body.detail
    else if (Array.isArray(body?.detail)) detail = body.detail.map((d: { msg?: string }) => d.msg).join('; ')
  } catch {
    // non-JSON body
  }
  if (response.status === 502) return new Error(detail || 'The protocol service is not reachable')
  return new Error(detail || `${fallback} (HTTP ${response.status})`)
}

async function svc<T>(path: string, init: RequestInit | undefined, fallback: string): Promise<T> {
  const response = await fetch(`/svc/${path}`, init)
  if (!response.ok) throw await toError(response, fallback)
  return (await response.json()) as T
}

export const protocolService = {
  upload(input: UploadInput) {
    const form = new FormData()
    form.append('file', input.file)
    form.append('kind', input.kind)
    form.append('name', input.name)
    if (input.procedureType) form.append('procedure_type', input.procedureType)
    if (input.createdBy) form.append('created_by', input.createdBy)
    return svc<UploadResult>('protocols/upload', { method: 'POST', body: form }, 'Upload failed')
  },
  list(kind?: ProtocolKind) {
    return svc<ProtocolSummary[]>(`protocols${kind ? `?kind=${kind}` : ''}`, undefined, 'Could not load protocols')
  },
  get(protocolId: string) {
    return svc<ProtocolDetail>(`protocols/${encodeURIComponent(protocolId)}`, undefined, 'Could not load protocol')
  },
  version(protocolId: string, versionId: string) {
    return svc<VersionSummary & { bundle: Record<string, unknown> | null }>(
      `protocols/${encodeURIComponent(protocolId)}/versions/${versionId}`, undefined, 'Could not load version')
  },
  saveDraft(protocolId: string, edits: MatrixEdit[]) {
    return svc<VersionSummary>(`protocols/${encodeURIComponent(protocolId)}/draft`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ edits }),
    }, 'Save failed')
  },
  approve(protocolId: string, versionId: string, reviewer: string) {
    return svc<VersionSummary>(`protocols/${encodeURIComponent(protocolId)}/versions/${versionId}/approve`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reviewer }),
    }, 'Approval failed')
  },
}

/** Poll a version until generation finishes (draft) or fails; throws on failure or timeout. */
export async function waitForGeneration(
  protocolId: string,
  versionId: string,
  onTick?: (elapsedSeconds: number) => void,
  timeoutSeconds = 900,
): Promise<VersionSummary> {
  const started = Date.now()
  for (;;) {
    const version = await protocolService.version(protocolId, versionId)
    if (version.status === 'failed') {
      const details = version.validation_errors?.length ? `: ${version.validation_errors.join('; ')}` : ''
      throw new Error(`Protocol generation failed - ${version.error ?? 'unknown error'}${details}`)
    }
    if (version.status !== 'processing') return version
    const elapsed = Math.round((Date.now() - started) / 1000)
    if (elapsed > timeoutSeconds) throw new Error('Protocol generation timed out')
    onTick?.(elapsed)
    await new Promise(resolve => setTimeout(resolve, 4000))
  }
}

/** Small wrapper adding loading/error state around one async protocol-service action. */
export function useProtocolAction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const run = useCallback(async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
    setLoading(true)
    setError(null)
    try {
      return await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      return undefined
    } finally {
      setLoading(false)
    }
  }, [])
  return { run, loading, error, setError }
}
