import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import OutboundAgents from "./pages/OutboundAgents";
import CreateOutboundFlow from "./pages/CreateOutboundFlow";
import OutboundFlowDetails from "./pages/OutboundFlowDetails";
import NeedsAction from "./pages/NeedsAction";
import AllEngagements from "./pages/AllEngagements";
import InboundTriage from "./pages/InboundTriage";
import InboundScheduling from "./pages/InboundScheduling";
import InboundIntake from "./pages/InboundIntake";
import PatientInteractionDetails from "./pages/PatientInteractionDetails";
import CreateTriageProtocol from "./pages/CreateTriageProtocol";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/outbound-agents" element={<OutboundAgents />} />
          <Route path="/outbound-agents/create" element={<CreateOutboundFlow />} />
          <Route path="/outbound-agents/:flowId" element={<OutboundFlowDetails />} />
          <Route path="/outbound-agents/:flowId/edit" element={<CreateOutboundFlow />} />
          <Route path="/needs-action" element={<NeedsAction />} />
          <Route path="/all-engagements" element={<AllEngagements />} />
          <Route path="/inbound-triage" element={<InboundTriage />} />
          <Route path="/inbound-scheduling" element={<InboundScheduling />} />
          <Route path="/inbound-intake" element={<InboundIntake />} />
          <Route path="/patient-interaction/:id" element={<PatientInteractionDetails />} />
          <Route path="/create-triage-protocol" element={<CreateTriageProtocol />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
