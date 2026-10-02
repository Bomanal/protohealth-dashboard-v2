import { useNavigate, useParams } from "react-router-dom"
import { useCallback, useEffect, useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConversationHistory } from "@/components/ConversationHistory"
import type { ConversationMessage } from "@/types/healthcare"
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Calendar,
  AlertTriangle,
  User,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react"

/** Shape returned by GET /case-details/{session_id} (src/api/case_details.py). */
type CaseDetailsItem = {
  call_id: string
  phone_number: string
  user_name: string | null
  last_call: string | null
  status: string | null
  preliminary_diagnosis: string | null
  triage_outcome: string | null
  call_log: unknown
  summary: string | null
  medical_history: string | null
  issue: string | null
  dob: string | null
}

type LoadState =
  | { kind: "loading" }
  | { kind: "not_found" }
  | { kind: "error"; message: string }
  | { kind: "loaded"; details: CaseDetailsItem }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  abandoned: "Abandoned",
  error: "Error",
}

const formatDateTime = (value: string | null) => {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** Normalise the JSONB transcript into ConversationMessage[]; unknown shapes yield []. */
const toMessages = (callLog: unknown): ConversationMessage[] => {
  if (!Array.isArray(callLog)) return []
  return callLog
    .filter((m): m is Record<string, unknown> => typeof m === "object" && m !== null)
    .map((m) => ({
      speaker: String(m.speaker ?? m.role ?? "Unknown"),
      message: String(m.message ?? m.content ?? m.text ?? ""),
      timestamp: new Date(typeof m.timestamp === "string" || typeof m.timestamp === "number" ? m.timestamp : NaN),
    }))
}

export default function PatientInteractionDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [state, setState] = useState<LoadState>({ kind: "loading" })

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!id || !UUID_RE.test(id)) {
      setState({ kind: "not_found" })
      return
    }
    setState({ kind: "loading" })
    try {
      const res = await fetch(`/case-details/${id}`, { signal })
      if (res.status === 404) {
        setState({ kind: "not_found" })
        return
      }
      if (!res.ok) {
        throw new Error(`Server responded with HTTP ${res.status}`)
      }
      const details = (await res.json()) as CaseDetailsItem
      setState({ kind: "loaded", details })
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      setState({ kind: "error", message: err instanceof Error ? err.message : "Failed to load case details" })
    }
  }, [id])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  const backButton = (
    <Button variant="ghost" size="sm" onClick={() => navigate("/all-engagements")}>
      <ArrowLeft className="h-4 w-4 mr-1" />
      Back to Interactions
    </Button>
  )

  if (state.kind !== "loaded") {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {backButton}
          <Card>
            <CardContent className="text-center py-8">
              {state.kind === "loading" && (
                <>
                  <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold mb-2">Loading...</h3>
                  <p className="text-muted-foreground">Fetching case details.</p>
                </>
              )}
              {state.kind === "not_found" && (
                <>
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Interaction Not Found</h3>
                  <p className="text-muted-foreground">The requested patient interaction could not be found.</p>
                </>
              )}
              {state.kind === "error" && (
                <>
                  <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Couldn't load this interaction</h3>
                  <p className="text-muted-foreground mb-4">{state.message}</p>
                  <Button variant="outline" onClick={() => load()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const data = state.details
  const displayName = data.user_name || "Unknown caller"
  const messages = toMessages(data.call_log)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {backButton}
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Patient Interaction Details
              </h1>
              <p className="text-muted-foreground mt-1">
                {displayName} • <span className="font-mono text-sm">{data.call_id}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Interaction Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Patient Name</label>
                    <p className="text-lg font-semibold">{displayName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">DOB</label>
                    <p className="text-lg">{data.dob || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <p className="text-lg">{data.phone_number || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Session ID</label>
                    <p className="text-sm font-mono break-all">{data.call_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Interaction</label>
                    <p className="text-lg">{formatDateTime(data.last_call)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Channel</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4" />
                      <span className="text-lg">Inbound phone (triage)</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge variant="outline" className="text-sm">
                        {data.status ? STATUS_LABELS[data.status] ?? data.status : "Unknown"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Preliminary Diagnosis</label>
                    <p className="text-lg">{data.preliminary_diagnosis || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Triage Outcome</label>
                    <p className="text-lg">{data.triage_outcome || "—"}</p>
                  </div>
                </div>

                {data.summary && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Clinical Summary</label>
                    <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm leading-relaxed">{data.summary}</p>
                    </div>
                  </div>
                )}

                {data.issue && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Patient Issue</label>
                    <div className="mt-2 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                      <p className="text-sm leading-relaxed">{data.issue}</p>
                    </div>
                  </div>
                )}

                {data.medical_history && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Medical History</label>
                    <div className="mt-2 p-4 bg-info/10 border border-info/20 rounded-lg">
                      <p className="text-sm leading-relaxed">{data.medical_history}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <ConversationHistory messages={messages} patientName={displayName} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium">Call ended</p>
                    <p className="text-sm text-muted-foreground">{formatDateTime(data.last_call)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions are placeholders until the workflow backend exists */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">Not yet available.</p>
                <Button className="w-full" variant="outline" disabled>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Patient
                </Button>
                <Button className="w-full" variant="outline" disabled>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button className="w-full" variant="outline" disabled>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Follow-up
                </Button>
                <Button className="w-full" variant="outline" disabled>
                  <FileText className="h-4 w-4 mr-2" />
                  Add Clinical Note
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
