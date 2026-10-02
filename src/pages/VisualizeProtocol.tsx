import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { ProtocolMatrixEditor } from "@/components/ProtocolMatrixEditor"

export default function VisualizeProtocolPage() {
  const navigate = useNavigate()
  // Select the first protocol by default
  const autoSelect = useCallback((protocols: { protocol_id: string }[]) => protocols[0]?.protocol_id, [])

  return (
    <ProtocolMatrixEditor
      autoSelect={autoSelect}
      onBack={() => navigate(-1)}
    />
  )
}
