import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getThreadConditionName } from '@/data/threadConditions';

interface ActiveThreadsListProps {
  threads: string[];
}

export function ActiveThreadsList({ threads }: ActiveThreadsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Active Threads</CardTitle>
      </CardHeader>
      <CardContent>
        {threads.length > 0 ? (
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {threads.map((threadId, index) => {
                const conditionName = getThreadConditionName(threadId);
                return (
                  <div
                    key={index}
                    className="p-3 bg-muted/50 rounded-lg border border-border"
                  >
                    <div className="font-mono text-sm font-bold text-foreground">
                      {threadId}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {conditionName}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No active threads
          </div>
        )}
      </CardContent>
    </Card>
  );
}
