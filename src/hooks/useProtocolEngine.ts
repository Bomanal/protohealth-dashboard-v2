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
  task_status: any
}

export function useProtocolEngine() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create protocol')
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
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
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to upload protocol data')
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
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
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to get protocol status')
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
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
  }
} 