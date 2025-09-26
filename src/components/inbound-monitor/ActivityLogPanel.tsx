import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActivityLogEntry } from '@/types/inbound-monitor';

interface ActivityLogPanelProps {
  activityLog: ActivityLogEntry[];
}

export function ActivityLogPanel({ activityLog }: ActivityLogPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        {activityLog.length > 0 ? (
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {activityLog.map((entry, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    index === 0 
                      ? 'bg-blue-50 border-l-blue-500' 
                      : 'bg-white border-l-gray-300'
                  }`}
                >
                  <div className="text-xs text-muted-foreground font-mono">
                    {entry.timestamp}
                  </div>
                  <div className="text-sm font-medium text-green-600 mt-1">
                    {entry.context}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No activity logged yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
