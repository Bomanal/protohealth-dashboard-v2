import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import OutboundAgents from "./pages/OutboundAgents";
import CreateOutboundFlow from "./pages/CreateOutboundFlow";
import OutboundFlowDetails from "./pages/OutboundFlowDetails";
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
