export type InteractionStatus = "engaged" | "message_sent" | "needs_action" | "in_queue" | "scheduled" | "scheduling_pending"

export type InteractionSource = "outbound_flow" | "inbound_text" | "inbound_phone" | "inbound_email" | "inbound_scheduling"

export interface ConversationMessage {
  timestamp: Date
  speaker: string
  message: string
}

export interface PatientInteraction {
  id: string
  patientName: string
  patientId: string
  phoneNumber: string
  dateOfBirth: string
  callNumber: number
  status: InteractionStatus
  source: InteractionSource
  sourceDetail?: string // e.g., "Post-Surgery Follow-up" for outbound flow
  timestamp: Date
  lastContact?: Date
  notes?: string
  priority: "low" | "medium" | "high"
  department: "cardiology" | "gastroenterology"
  conversationHistory?: ConversationMessage[]
  preliminaryDiagnosis?: string
  triageOutcome?: string
  clinicalSummary?: string
  patientIssue?: string
  medicalHistory?: string
}

export interface OutboundFlow {
  id: string
  name: string
  description: string
  department: "cardiology" | "gastroenterology"
  createdDate: Date
  patientCount: number
  completedCount: number
  needsActionCount: number
  status: "active" | "draft" | "completed"
}

export interface TriageProtocol {
  id: string
  name: string
  department: "cardiology" | "gastroenterology"
  symptoms: string[]
  lastUpdated: Date
  version: string
  createdBy: string
  status: "active" | "draft" | "archived"
}