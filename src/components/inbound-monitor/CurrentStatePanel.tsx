import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CurrentStateInfo {
  current_thread_type?: string;
  current_question_node?: string;
  protocol_id?: string;
  triage_protocol?: string;
  patient?: string;
  complaint?: string;
}

interface CurrentStatePanelProps {
  stateInfo: CurrentStateInfo;
}

export function CurrentStatePanel({ stateInfo }: CurrentStatePanelProps) {
  const stateItems = [
    { key: 'Current Thread Type', value: stateInfo.current_thread_type },
    { key: 'Current Question Node', value: stateInfo.current_question_node },
    { key: 'Protocol ID', value: stateInfo.protocol_id },
    { key: 'Triage Protocol', value: stateInfo.triage_protocol },
    { key: 'Patient', value: stateInfo.patient },
    { key: 'Complaint', value: stateInfo.complaint }
  ];

  const formatValue = (value: string | undefined) => {
    if (!value) return 'N/A';
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...';
    }
    return value;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Current Assessment State</CardTitle>
      </CardHeader>
      <CardContent>
        {stateItems.some(item => item.value) ? (
          <div className="space-y-3">
            {stateItems.map((item, index) => (
              item.value && (
                <div key={index} className="p-3 bg-muted/50 rounded-lg border-l-4 border-l-green-500">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    {item.key}
                  </div>
                  <div className="text-sm font-medium text-foreground break-words">
                    {formatValue(item.value)}
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No state data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
