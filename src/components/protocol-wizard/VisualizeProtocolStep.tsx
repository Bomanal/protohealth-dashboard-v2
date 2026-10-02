import { useCallback } from "react"
import { ProtocolData } from "../CreateProtocolWizard"
import { ProtocolMatrixEditor } from "@/components/ProtocolMatrixEditor"

interface VisualizeProtocolStepProps {
  data: ProtocolData
  onNext: () => void
  onBack: () => void
}

export function VisualizeProtocolStep({ data, onNext, onBack }: VisualizeProtocolStepProps) {
  // Auto-select the protocol created in the previous steps (matched by name)
  const autoSelect = useCallback(
    (protocols: { protocol_id: string; protocol_name: string; protocol_description: string }[]) => {
      if (!data.name) return undefined
      return protocols.find(p => p.protocol_name === data.name || p.protocol_description?.includes(data.name))?.protocol_id
    },
    [data.name]
  )

  return (
    <ProtocolMatrixEditor
      autoSelect={autoSelect}
      onBack={onBack}
      onConfirm={onNext}
      confirmDescription={(name) =>
        `Save "${data.name || name}" protocol? This will make it available for patient triage.`
      }
    />
  )
}
