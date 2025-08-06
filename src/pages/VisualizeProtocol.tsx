import { VisualizeProtocolStep } from "@/components/protocol-wizard/VisualizeProtocolStep";

export default function VisualizeProtocolPage() {
  // You can pass empty/default data and stub onNext/onBack for standalone use
  return (
    <div className="p-6">
      <VisualizeProtocolStep
        data={{ name: "", description: "", entryPoint: "", specialty: "" }}
        onNext={() => {}}
        onBack={() => {}}
      />
    </div>
  );
}
