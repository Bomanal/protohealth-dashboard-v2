import { ConversationMessage } from "@/types/healthcare"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Bot, User } from "lucide-react"

interface ConversationHistoryProps {
  messages: ConversationMessage[]
  patientName: string
}

export function ConversationHistory({ messages, patientName }: ConversationHistoryProps) {
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit" 
    })
  }

  const isAI = (speaker: string) => {
    return speaker.toLowerCase().includes("ai") || speaker.toLowerCase().includes("assistant")
  }

  if (!messages || messages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No conversation history available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Conversation History with {patientName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0">
                  {isAI(message.speaker) ? (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{message.speaker}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                    {isAI(message.speaker) && (
                      <Badge variant="secondary" className="text-xs">AI</Badge>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg max-w-[80%] ${
                    isAI(message.speaker) 
                      ? "bg-primary/5 border border-primary/10" 
                      : "bg-muted"
                  }`}>
                    <p className="text-sm">{message.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}