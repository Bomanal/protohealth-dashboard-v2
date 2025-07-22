import { useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { OutboundFlowCard } from "@/components/OutboundFlowCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockOutboundFlows } from "@/data/mockData"
import { OutboundFlow } from "@/types/healthcare"
import { 
  Plus, 
  Search, 
  Filter,
  Heart,
  Stethoscope,
  Bot
} from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function OutboundAgents() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<"all" | "cardiology" | "gastroenterology">("all")

  const filteredFlows = mockOutboundFlows.filter((flow) => {
    const matchesSearch = flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         flow.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || flow.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const cardiologyFlows = filteredFlows.filter(f => f.department === "cardiology")
  const gastroFlows = filteredFlows.filter(f => f.department === "gastroenterology")

  const getTotalStats = (flows: OutboundFlow[]) => {
    return {
      totalPatients: flows.reduce((sum, f) => sum + f.patientCount, 0),
      totalCompleted: flows.reduce((sum, f) => sum + f.completedCount, 0),
      totalNeedsAction: flows.reduce((sum, f) => sum + f.needsActionCount, 0)
    }
  }

  const allStats = getTotalStats(filteredFlows)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Outbound Agents
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage AI-driven outbound communication flows and patient outreach
            </p>
          </div>
          <Button 
            onClick={() => navigate("/outbound-agents/create")}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Flow
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Active Flows</span>
            </div>
            <p className="text-2xl font-bold">{filteredFlows.filter(f => f.status === "active").length}</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Total Patients</span>
            </div>
            <p className="text-2xl font-bold">{allStats.totalPatients}</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-success">Completed</span>
            </div>
            <p className="text-2xl font-bold text-success">{allStats.totalCompleted}</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-destructive">Need Action</span>
            </div>
            <p className="text-2xl font-bold text-destructive">{allStats.totalNeedsAction}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search flows by name or description..."
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
              All Departments
            </Button>
            <Button 
              variant={selectedDepartment === "cardiology" ? "default" : "outline"}
              onClick={() => setSelectedDepartment("cardiology")}
              size="sm"
              className="flex items-center gap-1"
            >
              <Heart className="h-4 w-4" />
              Cardiology
            </Button>
            <Button 
              variant={selectedDepartment === "gastroenterology" ? "default" : "outline"}
              onClick={() => setSelectedDepartment("gastroenterology")}
              size="sm"
              className="flex items-center gap-1"
            >
              <Stethoscope className="h-4 w-4" />
              Gastroenterology
            </Button>
          </div>
        </div>

        {/* Flows by Department */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Flows ({filteredFlows.length})</TabsTrigger>
            <TabsTrigger value="cardiology">
              <Heart className="h-4 w-4 mr-1" />
              Cardiology ({cardiologyFlows.length})
            </TabsTrigger>
            <TabsTrigger value="gastroenterology">
              <Stethoscope className="h-4 w-4 mr-1" />
              Gastroenterology ({gastroFlows.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredFlows.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No outbound flows found matching your criteria.</p>
                <Button 
                  onClick={() => navigate("/outbound-agents/create")}
                  className="mt-4"
                  variant="outline"
                >
                  Create Your First Flow
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFlows.map((flow) => (
                  <OutboundFlowCard key={flow.id} flow={flow} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cardiology" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cardiologyFlows.map((flow) => (
                <OutboundFlowCard key={flow.id} flow={flow} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gastroenterology" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gastroFlows.map((flow) => (
                <OutboundFlowCard key={flow.id} flow={flow} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}