import { useNavigate } from "react-router-dom"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { PROTOCOL_UPLOAD_DISABLED_MESSAGE } from "@/hooks/useProtocolEngine"

/** Shown when /protocol_engine/* returns HTTP 501 (pending schema migration). */
export function ProtocolUploadDisabledNotice({ message }: { message?: string | null }) {
  const navigate = useNavigate()
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Protocol upload unavailable</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{message || PROTOCOL_UPLOAD_DISABLED_MESSAGE}. Existing protocols can still be reviewed and edited.</p>
        <Button type="button" variant="outline" size="sm" onClick={() => navigate("/visualize-protocol")}>
          Review existing protocols
        </Button>
      </AlertDescription>
    </Alert>
  )
}
