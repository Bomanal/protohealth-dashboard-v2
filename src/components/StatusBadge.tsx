import { Badge } from "@/components/ui/badge"
import { InteractionStatus } from "@/types/healthcare"

interface StatusBadgeProps {
  status: InteractionStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: InteractionStatus) => {
    switch (status) {
      case "engaged":
        return { 
          variant: "default" as const, 
          className: "bg-success text-success-foreground",
          label: "Engaged" 
        }
      case "message_sent":
        return { 
          variant: "secondary" as const,
          className: "bg-warning text-warning-foreground",
          label: "Message Sent" 
        }
      case "needs_action":
        return { 
          variant: "destructive" as const,
          label: "Needs Action" 
        }
      case "in_queue":
        return { 
          variant: "outline" as const,
          className: "bg-info text-info-foreground border-info",
          label: "In Queue" 
        }
      case "scheduled":
        return {
          variant: "default" as const,
          className: "bg-success text-success-foreground",
          label: "Scheduled"
        }
      case "scheduling_pending":
        return {
          variant: "secondary" as const,
          className: "bg-warning text-warning-foreground", 
          label: "Scheduling Pending"
        }
      default:
        return { 
          variant: "outline" as const,
          label: status 
        }
    }
  }

  const { variant, className, label } = getStatusConfig(status)

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}