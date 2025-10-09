import { DashboardLayout } from "@/components/DashboardLayout";
import { InboundFlowMonitor } from "@/components/InboundFlowMonitor";

export default function VisualizeInbound() {
  return (
    <DashboardLayout>
      <InboundFlowMonitor />
    </DashboardLayout>
  );
}
