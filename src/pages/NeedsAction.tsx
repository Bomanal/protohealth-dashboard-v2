import { useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/StatusBadge"
import { mockPatientInteractions } from "@/data/mockData"
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Clock,
  MessageSquare,
  Phone,
  Heart,
  Stethoscope,
  ArrowRight
} from "lucide-react"

export default function NeedsAction() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  const needsActionInteractions = mockPatientInteractions.filter(i => i.status === "needs_action")
  
  const filteredInteractions = needsActionInteractions.filter(interaction => {
    const matchesSearch = interaction.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         interaction.sourceDetail?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || interaction.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case "cardiology":
        return <Heart className="h-4 w-4" />
      case "gastroenterology":
        return <Stethoscope className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getPriorityColor = (timestamp: Date) => {
    const hoursSince = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60)
    if (hoursSince > 24) return "destructive"
    if (hoursSince > 8) return "secondary"
    return "default"
  }

  const formatTimeAgo = (timestamp: Date) => {
    const hoursSince = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60)
    if (hoursSince < 1) return "< 1 hour ago"
    if (hoursSince < 24) return `${Math.floor(hoursSince)} hours ago`
    return `${Math.floor(hoursSince / 24)} days ago`
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Needs Action
            </h1>
            <p className="text-muted-foreground mt-1">
              Patient interactions requiring immediate follow-up
            </p>
          </div>
          <Badge variant="destructive" className="flex items-center gap-2 px-4 py-2">
            <AlertTriangle className="h-4 w-4" />
            {needsActionInteractions.length} Critical Items
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-destructive" />
                High Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {needsActionInteractions.filter(i => getPriorityColor(i.timestamp) === "destructive").length}
              </div>
              <p className="text-xs text-muted-foreground">Over 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Cardiology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {needsActionInteractions.filter(i => i.department === "cardiology").length}
              </div>
              <p className="text-xs text-muted-foreground">Needs follow-up</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-blue-500" />
                Gastroenterology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {needsActionInteractions.filter(i => i.department === "gastroenterology").length}
              </div>
              <p className="text-xs text-muted-foreground">Needs follow-up</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients, conditions, or sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedDepartment === "all" ? "default" : "outline"}
              onClick={() => setSelectedDepartment("all")}
              size="sm"
            >
              <Filter className="h-4 w-4 mr-1" />
              All Departments
            </Button>
            <Button
              variant={selectedDepartment === "cardiology" ? "default" : "outline"}
              onClick={() => setSelectedDepartment("cardiology")}
              size="sm"
            >
              <Heart className="h-4 w-4 mr-1" />
              Cardiology
            </Button>
            <Button
              variant={selectedDepartment === "gastroenterology" ? "default" : "outline"}
              onClick={() => setSelectedDepartment("gastroenterology")}
              size="sm"
            >
              <Stethoscope className="h-4 w-4 mr-1" />
              Gastro
            </Button>
          </div>
        </div>

        {/* Interactions List */}
        <div className="space-y-4">
          {filteredInteractions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items need action</h3>
                <p className="text-muted-foreground">All interactions are up to date.</p>
              </CardContent>
            </Card>
          ) : (
            filteredInteractions.map((interaction) => (
              <Card key={interaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getDepartmentIcon(interaction.department)}
                        <h3 className="text-lg font-semibold">{interaction.patientName}</h3>
                        <Badge variant="outline">
                          {interaction.department}
                        </Badge>
                        <Badge variant={getPriorityColor(interaction.timestamp)}>
                          {formatTimeAgo(interaction.timestamp)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-muted-foreground">
                          <strong>Source:</strong> {interaction.sourceDetail || interaction.source}
                        </p>
                        <p className="text-sm">
                          <strong>Last Contact:</strong> {interaction.lastContact ? formatTimeAgo(interaction.lastContact) : "No contact"}
                        </p>
                        <p className="text-sm">
                          <strong>Next Action:</strong> Follow up required
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge status={interaction.status} />
                        <Badge variant="secondary" className="text-xs">
                          Priority: {getPriorityColor(interaction.timestamp) === "destructive" ? "High" : "Medium"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" variant="default">
                        <Phone className="h-4 w-4 mr-1" />
                        Call Now
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}