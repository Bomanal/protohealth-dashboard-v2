import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

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
              {threads.map((threadId, index) => (
                // The monitor payload only carries thread ids; condition labels are not
                // available here (see /protocol/{id}/table-data for per-thread conditions).
                <div
                  key={`${threadId}-${index}`}
                  className="p-3 bg-muted/50 rounded-lg border border-border"
                >
                  <div className="font-mono text-sm font-bold text-foreground">
                    {threadId}
                  </div>
                </div>
              ))}
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
