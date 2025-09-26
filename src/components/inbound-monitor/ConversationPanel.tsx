import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConversationTurn } from '@/types/inbound-monitor';

interface ConversationPanelProps {
  conversationLog: ConversationTurn[];
}

export function ConversationPanel({ conversationLog }: ConversationPanelProps) {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getSpeakerLabel = (role: string) => {
    return role === 'user' ? 'Patient' : 'AI Doc';
  };

  const getConversationStyle = (role: string) => {
    return role === 'assistant' 
      ? 'bg-blue-50 border-l-blue-500' 
      : 'bg-purple-50 border-l-purple-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Conversation</CardTitle>
      </CardHeader>
      <CardContent>
        {conversationLog.length > 0 ? (
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {conversationLog.slice(-5).map((turn, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${getConversationStyle(turn.role)}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-bold text-foreground min-w-[60px]">
                      {getSpeakerLabel(turn.role)}:
                    </span>
                    <span className="text-sm text-foreground flex-1 leading-relaxed">
                      {truncateText(turn.content, 120)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No conversation data
          </div>
        )}
      </CardContent>
    </Card>
  );
}
