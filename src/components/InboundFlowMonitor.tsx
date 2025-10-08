import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useInboundFlowMonitor } from '@/hooks/useInboundFlowMonitor';
import { ConnectionStatus } from './inbound-monitor/ConnectionStatus';
import { MetricsGrid } from './inbound-monitor/MetricsGrid';
import { CurrentStatePanel } from './inbound-monitor/CurrentStatePanel';
import { ActiveThreadsList } from './inbound-monitor/ActiveThreadsList';
import { ProtocolInfoPanel } from './inbound-monitor/ProtocolInfoPanel';
import { ConversationPanel } from './inbound-monitor/ConversationPanel';
import { ActivityLogPanel } from './inbound-monitor/ActivityLogPanel';

export function InboundFlowMonitor() {
  const {
    currentState,
    activityLog,
    handleWebSocketMessage,
    getMetrics,
    getActiveThreads,
    getConversationLog,
    getProtocolInfo,
    getCurrentStateInfo
  } = useInboundFlowMonitor();

  const { connectionStatus } = useWebSocket({
    url: 'ws://localhost:8766',
    onMessage: handleWebSocketMessage,
    onError: (error) => console.error('WebSocket error:', error),
    onOpen: () => console.log('Connected to FlowManager monitor'),
    onClose: () => console.log('Disconnected from FlowManager monitor')
  });

  const metrics = getMetrics();
  const activeThreads = getActiveThreads();
  const conversationLog = getConversationLog();
  const protocolInfo = getProtocolInfo();
  const currentStateInfo = getCurrentStateInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">FlowManager State Monitor</h1>
        <p className="text-blue-100 mb-4">Real-time monitoring of assessment node state changes</p>
        <ConnectionStatus status={connectionStatus} />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Assessment Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <MetricsGrid metrics={metrics} />
            <div className="border-t pt-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Current State</h4>
              <CurrentStatePanel stateInfo={currentStateInfo} />
            </div>
          </CardContent>
        </Card>

        {/* Protocol & Threads */}
        <div className="space-y-6">
          <ProtocolInfoPanel protocolInfo={protocolInfo} />
          <ActiveThreadsList threads={activeThreads} />
        </div>
      </div>

      {/* Bottom Row: Conversation & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversationPanel conversationLog={conversationLog} />
        <ActivityLogPanel activityLog={activityLog} />
      </div>
    </div>
  );
}
