import { useState } from 'react'

interface CreateProtocolRequest {
  protocol_internal_id: string
  protocol_name?: string
  protocol_description?: string
}

interface CreateProtocolResponse {
  protocol_id: string
  protocol_internal_id: string
  protocol_name?: string
  protocol_description?: string
  message: string
}

interface UploadProtocolResponse {
  protocol_id: string
  protocol_internal_id: string
  task_id: string
  message: string
}

interface ProtocolStatusResponse {
  protocol_internal_id: string
  protocol_id: string
  protocol_name: string
  protocol_status: string
  task_status: unknown
}

/**
 * Thrown when the backend reports HTTP 501 for /protocol_engine/* — protocol upload is
 * disabled until the triage_protocols_list schema migration lands
 * (see PROTOCOL_UPLOAD_ENABLED in src/api/protocol_engine.py).
 */
export class ProtocolEngineDisabledError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ProtocolEngineDisabledError'
  }
}

export const PROTOCOL_UPLOAD_DISABLED_MESSAGE =
  'Protocol upload is temporarily disabled pending schema migration'

/** Convert a non-OK response into an Error, tolerating non-JSON bodies. */
async function toError(response: Response, fallback: string): Promise<Error> {
  let detail: string | undefined
  try {
    const body = await response.json()
    if (typeof body?.detail === 'string') detail = body.detail
  } catch {
    // non-JSON body
  }
  if (response.status === 501) {
    return new ProtocolEngineDisabledError(detail || PROTOCOL_UPLOAD_DISABLED_MESSAGE)
  }
  return new Error(detail || `${fallback} (HTTP ${response.status})`)
}

export function useProtocolEngine() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [disabled, setDisabled] = useState(false)

  const handleError = (err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred'
    setError(errorMessage)
    if (err instanceof ProtocolEngineDisabledError) setDisabled(true)
  }

  const createProtocol = async (data: CreateProtocolRequest): Promise<CreateProtocolResponse> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/protocol_engine/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw await toError(response, 'Failed to create protocol')
      }

      return await response.json()
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const uploadProtocolData = async (protocolInternalId: string, file: File): Promise<UploadProtocolResponse> => {
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/protocol_engine/upload/${protocolInternalId}`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw await toError(response, 'Failed to upload protocol data')
      }

      return await response.json()
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getProtocolStatus = async (protocolInternalId: string): Promise<ProtocolStatusResponse> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/protocol_engine/status/${protocolInternalId}`)

      if (!response.ok) {
        throw await toError(response, 'Failed to get protocol status')
      }

      return await response.json()
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createProtocol,
    uploadProtocolData,
    getProtocolStatus,
    loading,
    error,
    /** True once the backend has reported that protocol upload is disabled (HTTP 501). */
    disabled
  }
} 