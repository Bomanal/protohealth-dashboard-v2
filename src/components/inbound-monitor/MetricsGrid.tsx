import { Card, CardContent } from '@/components/ui/card';

interface Metrics {
  active_threads_count: number;
  asked_questions_count: number;
  conversation_turns: number;
  current_node: string;
}

interface MetricsGridProps {
  metrics: Metrics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const metricItems = [
    {
      label: 'Active Threads',
      value: metrics.active_threads_count || '-',
      color: 'text-blue-600'
    },
    {
      label: 'Questions Asked',
      value: metrics.asked_questions_count || '-',
      color: 'text-green-600'
    },
    {
      label: 'Conversation Turns',
      value: metrics.conversation_turns || '-',
      color: 'text-purple-600'
    },
    {
      label: 'Current Node',
      value: metrics.current_node || '-',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metricItems.map((item, index) => (
        <Card key={index} className="text-center">
          <CardContent className="p-4">
            <div className={`text-2xl font-bold ${item.color}`}>
              {item.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {item.label}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
