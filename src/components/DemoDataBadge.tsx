import { Badge } from "@/components/ui/badge"
import { FlaskConical } from "lucide-react"

/** Marks pages that render hard-coded mock data, so they aren't mistaken for live data. */
export function DemoDataBadge({ className = "" }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={`border-amber-500 bg-amber-50 text-amber-800 gap-1 ${className}`}
      title="This page shows sample data, not live patient records"
    >
      <FlaskConical className="h-3 w-3" />
      Demo data
    </Badge>
  )
}
