import { useCallback } from "react"
import { ProtocolData } from "../CreateProtocolWizard"
import { ProtocolMatrixEditor } from "@/components/ProtocolMatrixEditor"
import { OutboundProtocolReview } from "./OutboundProtocolReview"

interface VisualizeProtocolStepProps {
  data: ProtocolData
  onNext: () => void
  onBack: () => void
}

export function VisualizeProtocolStep({ data, onNext, onBack }: VisualizeProtocolStepProps) {
  // Select the protocol the upload step just generated
  const autoSelect = useCallback(
    (protocols: { protocol_id: string }[]) => protocols.find(p => p.protocol_id === data.protocol_id)?.protocol_id,
    [data.protocol_id]
  )

  if (data.kind === "outbound" && data.protocol_id) {
    return <OutboundProtocolReview protocolId={data.protocol_id} onBack={onBack} onDone={onNext} />
  }
  return (
    <ProtocolMatrixEditor
      autoSelect={autoSelect}
      onBack={onBack}
      onConfirm={onNext}
      confirmDescription={(name) =>
        `Save pending changes to "${data.name || name}" as a draft? Patient calls use the protocol only after a clinician approves it.`
      }
    />
  )
}
