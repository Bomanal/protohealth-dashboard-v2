import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProtocolInfo {
  protocol_id?: string;
  protocol_name?: string;
  current_question?: string;
  current_node_id?: string;
}

interface ProtocolInfoPanelProps {
  protocolInfo: ProtocolInfo;
}

export function ProtocolInfoPanel({ protocolInfo }: ProtocolInfoPanelProps) {
  const formatCurrentQuestion = () => {
    if (protocolInfo.current_question && protocolInfo.current_node_id) {
      return `[${protocolInfo.current_node_id}] ${protocolInfo.current_question}`;
    } else if (protocolInfo.current_question) {
      return protocolInfo.current_question;
    } else if (protocolInfo.current_node_id) {
      return `Node: ${protocolInfo.current_node_id}`;
    }
    return 'No current question';
  };

  const protocolItems = [
    { key: 'Protocol ID', value: protocolInfo.protocol_id },
    { key: 'Protocol Name', value: protocolInfo.protocol_name },
    { key: 'Current Question', value: formatCurrentQuestion() }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Protocol Information</CardTitle>
      </CardHeader>
      <CardContent>
        {protocolItems.some(item => item.value && item.value !== 'No current question') ? (
          <div className="space-y-3">
            {protocolItems.map((item, index) => (
              item.value && item.value !== 'No current question' && (
                <div key={index} className="p-3 bg-muted/50 rounded-lg border-l-4 border-l-blue-500">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    {item.key}
                  </div>
                  <div className="text-sm font-medium text-foreground break-words">
                    {item.value}
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No protocol information
          </div>
        )}
      </CardContent>
    </Card>
  );
}
