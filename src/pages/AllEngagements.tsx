import { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Eye,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react"

/** Shape returned by GET /case-list (src/api/case_list.py). */
type CaseListItem = {
  call_id: string // conversation session id
  phone_number: string
  user_name: string | null
  last_call: string | null
  status: string | null // conversation_status: completed | abandoned | error
  preliminary_diagnosis: string | null // triage_outcomes.final_condition
  triage_outcome: string | null
  dob: string | null
}

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  abandoned: "Abandoned",
  error: "Error",
}

const statusBadgeVariant = (status: string | null): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "completed":
      return "default"
    case "abandoned":
      return "secondary"
    case "error":
      return "destructive"
    default:
      return "outline"
  }
}

const formatDateTime = (value: string | null) => {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function AllEngagements() {
  const navigate = useNavigate()
  const [cases, setCases] = useState<CaseListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedOutcome, setSelectedOutcome] = useState("all")

  const loadCases = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/case-list", { signal })
      if (!res.ok) {
        throw new Error(`Server responded with HTTP ${res.status}`)
      }
      const data: unknown = await res.json()
      if (!Array.isArray(data)) {
        throw new Error("Unexpected response format")
      }
      const sorted = (data as CaseListItem[]).slice().sort((a, b) => {
        if (!a.last_call && !b.last_call) return 0
        if (!a.last_call) return 1
        if (!b.last_call) return -1
        return new Date(b.last_call).getTime() - new Date(a.last_call).getTime()
      })
      setCases(sorted)
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      setCases([])
      setError(err instanceof Error ? err.message : "Failed to load engagements")
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    loadCases(controller.signal)
    return () => controller.abort()
  }, [loadCases])

  const outcomeOptions = useMemo(
    () => Array.from(new Set(cases.map(c => c.triage_outcome).filter((o): o is string => !!o))).sort(),
    [cases]
  )

  const filteredCases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const qDigits = q.replace(/\D/g, "")
    return cases.filter(c => {
      const matchesSearch =
        !q ||
        [c.user_name, c.call_id, c.preliminary_diagnosis, c.triage_outcome]
          .some(v => v?.toLowerCase().includes(q)) ||
        c.phone_number?.toLowerCase().includes(q) ||
        (qDigits.length >= 3 && c.phone_number?.replace(/\D/g, "").includes(qDigits))
      const matchesStatus = selectedStatus === "all" || c.status === selectedStatus
      const matchesOutcome = selectedOutcome === "all" || c.triage_outcome === selectedOutcome
      return matchesSearch && matchesStatus && matchesOutcome
    })
  }, [cases, searchQuery, selectedStatus, selectedOutcome])

  const totalCount = cases.length
  const completedCount = cases.filter(c => c.status === "completed").length
  const abandonedCount = cases.filter(c => c.status === "abandoned").length
  const errorCount = cases.filter(c => c.status === "error").length

  const renderBody = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading engagements...
        </div>
      )
    }
    if (error) {
      return (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Couldn't load engagements</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => loadCases()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )
    }
    if (cases.length === 0) {
      return (
        <div className="text-center py-8">
          <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No engagements yet</h3>
          <p className="text-muted-foreground">Completed triage calls will appear here.</p>
        </div>
      )
    }
    if (filteredCases.length === 0) {
      return (
        <div className="text-center py-8">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No engagements match your filters</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      )
    }
    return (
      <div className="space-y-4">
        {filteredCases.map((c) => (
          <Card key={c.call_id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Patient Info */}
                  <div className="space-y-1">
                    <h4 className="font-semibold text-lg text-foreground">
                      {c.user_name || <span className="text-muted-foreground italic">Unknown caller</span>}
                    </h4>
                    {c.dob && <p className="text-sm text-muted-foreground">DOB: {c.dob}</p>}
                    <p className="text-sm text-muted-foreground">{c.phone_number}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate" title={c.call_id}>
                      Session {c.call_id.slice(0, 8)}
                    </p>
                  </div>

                  {/* Date & Channel */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last call</p>
                    <p className="text-sm font-medium">{formatDateTime(c.last_call)}</p>
                    <p className="text-sm text-muted-foreground">Inbound triage</p>
                  </div>

                  {/* Status & Condition */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</p>
                    <Badge variant={statusBadgeVariant(c.status)} className="text-xs font-medium">
                      {c.status ? STATUS_LABELS[c.status] ?? c.status : "Unknown"}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {c.preliminary_diagnosis || "No condition recorded"}
                    </p>
                  </div>

                  {/* Triage Outcome */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Triage outcome</p>
                    <p className="text-sm font-medium">{c.triage_outcome || "Pending"}</p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/patient-interaction/${c.call_id}`)}
                    className="hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              All Engagements
            </h1>
            <p className="text-muted-foreground mt-1">
              Inbound triage conversations recorded by the voice agent
            </p>
          </div>
          <Button variant="outline" onClick={() => loadCases()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Total Engagements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading || error ? "—" : totalCount}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{loading || error ? "—" : completedCount}</div>
              <p className="text-xs text-muted-foreground">Triage finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <XCircle className="h-4 w-4 text-muted-foreground" />
                Abandoned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading || error ? "—" : abandonedCount}</div>
              <p className="text-xs text-muted-foreground">Caller dropped off</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{loading || error ? "—" : errorCount}</div>
              <p className="text-xs text-muted-foreground">Pipeline errors</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Engagements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, session id, condition or outcome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex gap-2">
                {(["all", "completed", "abandoned", "error"] as const).map(s => (
                  <Button
                    key={s}
                    variant={selectedStatus === s ? "default" : "outline"}
                    onClick={() => setSelectedStatus(s)}
                    size="sm"
                  >
                    {s === "all" ? "All Status" : STATUS_LABELS[s]}
                  </Button>
                ))}
              </div>

              <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
                <SelectTrigger className="w-[240px] h-9">
                  <SelectValue placeholder="Triage outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All triage outcomes</SelectItem>
                  {outcomeOptions.map(o => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Engagements List */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Engagements ({loading || error ? "—" : filteredCases.length})</CardTitle>
            {!loading && !error && (
              <CardDescription>
                Showing {filteredCases.length} of {totalCount} total engagements
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>{renderBody()}</CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
