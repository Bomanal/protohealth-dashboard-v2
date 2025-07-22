import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OutboundFlow } from "@/types/healthcare"
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  Heart,
  Stethoscope,
  ArrowRight,
  Edit
} from "lucide-react"
import { useNavigate } from "react-router-dom"

interface OutboundFlowCardProps {
  flow: OutboundFlow
}

export function OutboundFlowCard({ flow }: OutboundFlowCardProps) {
  const navigate = useNavigate()
  
  const completionRate = Math.round((flow.completedCount / flow.patientCount) * 100)
  
  const getDepartmentIcon = (department: string) => {
    return department === "cardiology" ? Heart : Stethoscope
  }
  
  const DepartmentIcon = getDepartmentIcon(flow.department)
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success text-success-foreground"
      case "draft":
        return "bg-warning text-warning-foreground"
      case "completed":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:bg-card transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <DepartmentIcon className="h-5 w-5 text-primary" />
            <Badge variant="outline" className="text-xs capitalize">
              {flow.department}
            </Badge>
            <Badge className={`text-xs ${getStatusColor(flow.status)}`}>
              {flow.status}
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/outbound-agents/${flow.id}/edit`)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-lg leading-tight">{flow.name}</CardTitle>
        <CardDescription className="text-sm">{flow.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{flow.patientCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Patients</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-2xl font-bold text-success">{flow.completedCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-2xl font-bold text-destructive">{flow.needsActionCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Need Action</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Created Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Created {flow.createdDate.toLocaleDateString()}</span>
        </div>

        {/* Action Button */}
        <Button 
          className="w-full" 
          onClick={() => navigate(`/outbound-agents/${flow.id}`)}
        >
          View Details
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}