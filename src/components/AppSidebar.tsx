import { useState } from "react"
import { 
  Bot, 
  MessageSquare, 
  Calendar, 
  UserPlus, 
  Send, 
  AlertTriangle, 
  Eye,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Activity
} from "lucide-react"
import { NavLink, useLocation, Link } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const manageProtocolsItems = [
  { title: "Inbound Triage", url: "/inbound-triage", icon: MessageSquare },
  { title: "Inbound Scheduling", url: "/inbound-scheduling", icon: Calendar, comingSoon: true },
  { title: "Inbound Patient Intake", url: "/inbound-intake", icon: UserPlus, comingSoon: true },
  { title: "Outbound Communications", url: "/outbound-agents", icon: Send },
  { title: "Create Protocol", url: "/create-protocol", icon: Bot },
  { title: "Visualize Protocol", url: "/visualize-protocol", icon: BarChart3 },
]

const patientInteractionsItems = [
  { title: "Needs Action", url: "/needs-action", icon: AlertTriangle },
  { title: "View All Engagements", url: "/all-engagements", icon: Eye },
  { title: "Trigger Outbound Calls", url: "/trigger-outbound-calls", icon: Send },
  { title: "Visualize Inbound", url: "/visualize-inbound", icon: Activity },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const [manageProtocolsOpen, setManageProtocolsOpen] = useState(true)
  const [patientInteractionsOpen, setPatientInteractionsOpen] = useState(true)
  const collapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50"

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="h-8 w-8 text-primary" />
              <div className="absolute inset-0 h-8 w-8 bg-gradient-primary rounded-lg opacity-20" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
                  ProtoHealth
                </h1>
                <p className="text-sm text-sidebar-foreground/80">NurseAssist Dashboard</p>
              </div>
            )}
          </div>
        </div>

        <Collapsible open={manageProtocolsOpen} onOpenChange={setManageProtocolsOpen}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-sidebar-accent/50 rounded-md p-2">
                {!collapsed && "Manage Protocols"}
                {!collapsed && (manageProtocolsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {manageProtocolsItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild={!item.comingSoon}>
                        {item.comingSoon ? (
                          <div className="flex items-center gap-2 px-2 py-1.5 text-sidebar-foreground/50 cursor-not-allowed">
                            <item.icon className="h-4 w-4" />
                            {!collapsed && (
                              <div className="flex items-center gap-2">
                                <span>{item.title}</span>
                                <span className="text-xs bg-sidebar-accent/50 px-2 py-0.5 rounded-full">Coming Soon</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <NavLink to={item.url} className={getNavCls}>
                            <item.icon className="h-4 w-4" />
                            {!collapsed && <span>{item.title}</span>}
                          </NavLink>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Collapsible open={patientInteractionsOpen} onOpenChange={setPatientInteractionsOpen}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-sidebar-accent/50 rounded-md p-2">
                {!collapsed && "Patient Interactions"}
                {!collapsed && (patientInteractionsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {patientInteractionsItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavCls}>
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
    </Sidebar>
  )
}