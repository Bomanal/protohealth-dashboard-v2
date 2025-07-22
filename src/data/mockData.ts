import { PatientInteraction, OutboundFlow, TriageProtocol } from "@/types/healthcare"

export const mockPatientInteractions: PatientInteraction[] = [
  {
    id: "1",
    patientName: "Sarah Johnson",
    patientId: "PT-2024-001",
    status: "needs_action",
    source: "outbound_flow",
    sourceDetail: "Post-Cardiac Catheterization Follow-up",
    timestamp: new Date("2024-01-22T08:30:00"),
    lastContact: new Date("2024-01-22T08:30:00"),
    notes: "Patient reports chest discomfort and shortness of breath",
    priority: "high",
    department: "cardiology"
  },
  {
    id: "2",
    patientName: "Michael Chen",
    patientId: "PT-2024-002",
    status: "engaged",
    source: "inbound_phone",
    timestamp: new Date("2024-01-22T09:15:00"),
    lastContact: new Date("2024-01-22T09:15:00"),
    notes: "Successfully provided colonoscopy prep instructions",
    priority: "low",
    department: "gastroenterology"
  },
  {
    id: "3",
    patientName: "Emma Williams",
    patientId: "PT-2024-003",
    status: "message_sent",
    source: "outbound_flow",
    sourceDetail: "Pre-Endoscopy Preparation",
    timestamp: new Date("2024-01-22T07:45:00"),
    lastContact: new Date("2024-01-22T07:45:00"),
    priority: "medium",
    department: "gastroenterology"
  },
  {
    id: "4",
    patientName: "Robert Davis",
    patientId: "PT-2024-004",
    status: "in_queue",
    source: "inbound_text",
    timestamp: new Date("2024-01-22T10:20:00"),
    notes: "Questions about medication timing",
    priority: "medium",
    department: "cardiology"
  },
  {
    id: "5",
    patientName: "Lisa Anderson",
    patientId: "PT-2024-005",
    status: "needs_action",
    source: "inbound_scheduling",
    timestamp: new Date("2024-01-22T11:00:00"),
    notes: "Urgent rescheduling needed due to symptoms",
    priority: "high",
    department: "cardiology"
  },
  {
    id: "6",
    patientName: "James Wilson",
    patientId: "PT-2024-006",
    status: "engaged",
    source: "outbound_flow",
    sourceDetail: "Heart Failure Management Check-in",
    timestamp: new Date("2024-01-22T06:30:00"),
    lastContact: new Date("2024-01-22T06:30:00"),
    priority: "medium",
    department: "cardiology"
  },
  {
    id: "7",
    patientName: "Maria Garcia",
    patientId: "PT-2024-007",
    status: "scheduled",
    source: "inbound_scheduling",
    timestamp: new Date("2024-01-22T09:45:00"),
    notes: "Successfully scheduled for upper endoscopy",
    priority: "low",
    department: "gastroenterology"
  },
  {
    id: "8",
    patientName: "David Thompson",
    patientId: "PT-2024-008",
    status: "message_sent",
    source: "outbound_flow",
    sourceDetail: "Post-Surgery Recovery Instructions",
    timestamp: new Date("2024-01-22T08:00:00"),
    priority: "medium",
    department: "gastroenterology"
  }
]

export const mockOutboundFlows: OutboundFlow[] = [
  {
    id: "of-1",
    name: "Post-Cardiac Catheterization Follow-up",
    description: "24-48 hour follow-up calls for patients after cardiac catheterization procedures",
    department: "cardiology",
    createdDate: new Date("2024-01-15T00:00:00"),
    patientCount: 12,
    completedCount: 8,
    needsActionCount: 2,
    status: "active"
  },
  {
    id: "of-2", 
    name: "Pre-Endoscopy Preparation",
    description: "Educational outreach and preparation instructions for upcoming endoscopy procedures",
    department: "gastroenterology",
    createdDate: new Date("2024-01-18T00:00:00"),
    patientCount: 25,
    completedCount: 18,
    needsActionCount: 1,
    status: "active"
  },
  {
    id: "of-3",
    name: "Heart Failure Management Check-in",
    description: "Weekly check-ins for patients with heart failure to monitor symptoms and medication compliance",
    department: "cardiology", 
    createdDate: new Date("2024-01-20T00:00:00"),
    patientCount: 8,
    completedCount: 6,
    needsActionCount: 0,
    status: "active"
  },
  {
    id: "of-4",
    name: "Post-Surgery Recovery Instructions",
    description: "Day-after surgery follow-up with recovery instructions and symptom monitoring",
    department: "gastroenterology",
    createdDate: new Date("2024-01-16T00:00:00"),
    patientCount: 15,
    completedCount: 12,
    needsActionCount: 1,
    status: "active"
  }
]

export const mockTriageProtocols: TriageProtocol[] = [
  {
    id: "tp-1",
    name: "Chest Pain Assessment",
    department: "cardiology",
    symptoms: ["chest pain", "shortness of breath", "palpitations"],
    lastUpdated: new Date("2024-01-15T00:00:00"),
    version: "2.1",
    createdBy: "Dr. Sarah Mitchell",
    status: "active"
  },
  {
    id: "tp-2",
    name: "Abdominal Pain Triage",
    department: "gastroenterology", 
    symptoms: ["abdominal pain", "nausea", "vomiting", "diarrhea"],
    lastUpdated: new Date("2024-01-18T00:00:00"),
    version: "1.3",
    createdBy: "Dr. Michael Rodriguez",
    status: "active"
  },
  {
    id: "tp-3",
    name: "Medication Side Effects - Cardiac",
    department: "cardiology",
    symptoms: ["dizziness", "fatigue", "swelling"],
    lastUpdated: new Date("2024-01-20T00:00:00"),
    version: "1.0",
    createdBy: "Nurse Manager Jane Smith",
    status: "active"
  }
]