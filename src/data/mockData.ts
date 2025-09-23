import { PatientInteraction, OutboundFlow, TriageProtocol } from "@/types/healthcare"

export const mockPatientInteractions: PatientInteraction[] = [
  {
    id: "1",
    patientName: "Sarah Johnson",
    patientId: "PT-2024-001",
    phoneNumber: "(555) 123-4567",
    dateOfBirth: "1975-03-15",
    callNumber: 1,
    status: "needs_action",
    source: "outbound_flow",
    sourceDetail: "Post-Cardiac Catheterization Follow-up",
    timestamp: new Date("2024-01-22T08:30:00"),
    lastContact: new Date("2024-01-22T08:30:00"),
    notes: "Patient reports chest discomfort and shortness of breath. AI detected concerning symptoms in follow-up call. Requires immediate physician review.",
    priority: "high",
    department: "cardiology",
    // Outbound-specific fields
    connectedPersonName: "Sarah Johnson",
    connectedPersonRelation: "Self",
    callCompleted: true,
    patientSatisfied: false,
    additionalQuestions: "Patient asked about when to return to normal activities and whether the chest discomfort is normal.",
    concernsRaised: "Patient is worried about recurring symptoms and potential complications from the procedure.",
    confidenceLevel: 7,
    followUpNeeded: true,
    rescheduleRequested: false,
    medicalHistory: "History of coronary artery disease, recent cardiac catheterization, hypertension, hyperlipidemia.",
    conversationHistory: [
      {
        timestamp: new Date("2024-01-22T08:30:00"),
        speaker: "AI Assistant",
        message: "Good morning Mrs. Johnson! This is NurseAssist AI calling for your follow-up after yesterday's cardiac catheterization. How are you feeling today?"
      },
      {
        timestamp: new Date("2024-01-22T08:31:00"),
        speaker: "Sarah Johnson",
        message: "I'm having some chest discomfort and feel short of breath when I walk around."
      },
      {
        timestamp: new Date("2024-01-22T08:31:30"),
        speaker: "AI Assistant", 
        message: "I understand that must be concerning. Can you describe the chest discomfort? Is it sharp, dull, or pressure-like?"
      },
      {
        timestamp: new Date("2024-01-22T08:32:00"),
        speaker: "Sarah Johnson",
        message: "It feels like pressure, similar to what I had before the procedure but not as severe."
      },
      {
        timestamp: new Date("2024-01-22T08:32:30"),
        speaker: "AI Assistant",
        message: "Thank you for that information. I'm flagging this for immediate review by your cardiologist. Someone from Dr. Martinez's team will call you within the next hour. In the meantime, please avoid physical exertion and call 911 if symptoms worsen."
      }
    ]
  },
  {
    id: "2",
    patientName: "Michael Chen",
    patientId: "PT-2024-002",
    phoneNumber: "(555) 234-5678",
    dateOfBirth: "1968-07-22",
    callNumber: 1,
    status: "engaged",
    source: "inbound_phone",
    timestamp: new Date("2024-01-22T09:15:00"),
    lastContact: new Date("2024-01-22T09:15:00"),
    notes: "Successfully provided colonoscopy prep instructions. Patient understood all steps and scheduled prep reminder calls.",
    priority: "low",
    department: "gastroenterology",
    preliminaryDiagnosis: "Routine colonoscopy prep",
    triageOutcome: "Completed",
    clinicalSummary: "Patient called for colonoscopy preparation instructions. Provided comprehensive prep guidance and scheduled reminder calls.",
    patientIssue: "Patient needed clarification on colonoscopy preparation procedures and timing.",
    medicalHistory: "Routine screening colonoscopy, no significant GI history.",
    conversationHistory: [
      {
        timestamp: new Date("2024-01-22T09:15:00"),
        speaker: "Michael Chen",
        message: "Hi, I'm calling about my colonoscopy prep instructions. I'm scheduled for Thursday and I'm not sure what I need to do."
      },
      {
        timestamp: new Date("2024-01-22T09:15:30"),
        speaker: "AI Assistant",
        message: "Hello Mr. Chen! I'll be happy to help you with your colonoscopy preparation. Let me pull up your appointment details... I see you're scheduled with Dr. Patel on Thursday at 10 AM. The prep is very important for a successful procedure."
      },
      {
        timestamp: new Date("2024-01-22T09:16:00"),
        speaker: "AI Assistant",
        message: "Starting Wednesday morning, you'll need to begin a clear liquid diet - this includes water, clear broths, tea, coffee without cream, and clear juices. Avoid anything red or purple in color."
      },
      {
        timestamp: new Date("2024-01-22T09:17:00"),
        speaker: "Michael Chen",
        message: "Okay, clear liquids starting Wednesday morning. What about the prep solution?"
      },
      {
        timestamp: new Date("2024-01-22T09:17:30"),
        speaker: "AI Assistant",
        message: "You'll take the first dose of GoLYTELY at 6 PM Wednesday evening, and the second dose at 6 AM Thursday morning. I'm sending you a detailed timeline to your phone. Would you like me to schedule reminder calls?"
      },
      {
        timestamp: new Date("2024-01-22T09:18:00"),
        speaker: "Michael Chen",
        message: "Yes, reminders would be great. Thank you so much!"
      }
    ]
  },
  {
    id: "3",
    patientName: "Emma Williams",
    patientId: "PT-2024-003",
    phoneNumber: "(555) 345-6789",
    dateOfBirth: "1982-11-08",
    callNumber: 1,
    status: "engaged",
    source: "outbound_flow",
    sourceDetail: "Pre-Endoscopy Preparation",
    timestamp: new Date("2024-01-22T07:45:00"),
    lastContact: new Date("2024-01-22T07:45:00"),
    priority: "medium",
    department: "gastroenterology",
    notes: "Successfully completed pre-procedure preparation call. Patient well-informed and ready.",
    // Outbound-specific fields
    connectedPersonName: "Emma Williams",
    connectedPersonRelation: "Self",
    callCompleted: true,
    patientSatisfied: true,
    additionalQuestions: "Patient asked about recovery time and when she can return to work.",
    concernsRaised: "Mild anxiety about the sedation process but no major concerns.",
    confidenceLevel: 9,
    followUpNeeded: false,
    rescheduleRequested: false,
    medicalHistory: "Upper GI symptoms, scheduled for diagnostic endoscopy.",
    conversationHistory: [
      {
        timestamp: new Date("2024-01-22T07:45:00"),
        speaker: "AI Assistant",
        message: "Good morning Emma! This is NurseAssist AI from Dr. Thompson's office. Your upper endoscopy is scheduled for tomorrow at 2 PM. I'm sending your preparation instructions now."
      },
      {
        timestamp: new Date("2024-01-22T07:46:00"),
        speaker: "AI Assistant",
        message: "Please fast for 12 hours before your procedure - no food or drink after 2 AM tonight. Take your regular medications with a small sip of water. Arrange for someone to drive you home as you'll be sedated."
      },
      {
        timestamp: new Date("2024-01-22T07:50:00"),
        speaker: "Emma Williams",
        message: "Got it, thank you! My husband will drive me."
      }
    ]
  },
  {
    id: "4",
    patientName: "Robert Davis",
    patientId: "PT-2024-004",
    phoneNumber: "(555) 456-7890",
    dateOfBirth: "1955-09-14",
    callNumber: 1,
    status: "in_queue",
    source: "inbound_text",
    timestamp: new Date("2024-01-22T10:20:00"),
    notes: "Questions about medication timing for blood pressure medications",
    priority: "medium",
    department: "cardiology",
    preliminaryDiagnosis: "Medication timing inquiry",
    triageOutcome: "Needs action",
    clinicalSummary: "Patient inquiry regarding missed blood pressure medication. Awaiting clinical guidance for medication timing.",
    patientIssue: "Patient forgot to take morning blood pressure medication, seeking guidance on timing.",
    medicalHistory: "Hypertension, on antihypertensive therapy.",
    conversationHistory: [
      {
        timestamp: new Date("2024-01-22T10:20:00"),
        speaker: "Robert Davis",
        message: "Hi, I forgot to take my morning blood pressure medication. It's now 10 AM. Should I take it now or wait until tonight?"
      }
    ]
  },
  {
    id: "5",
    patientName: "Lisa Anderson",
    patientId: "PT-2024-005",
    phoneNumber: "(555) 567-8901",
    dateOfBirth: "1970-04-30",
    callNumber: 2,
    status: "needs_action",
    source: "inbound_scheduling",
    timestamp: new Date("2024-01-22T11:00:00"),
    notes: "Urgent rescheduling needed due to new symptoms. Patient reports worsening heart palpitations.",
    priority: "high",
    department: "cardiology",
    preliminaryDiagnosis: "Worsening palpitations",
    triageOutcome: "Needs action",
    clinicalSummary: "Patient reporting increased frequency and duration of heart palpitations. Urgent cardiology evaluation needed.",
    patientIssue: "Worsening heart palpitations - increased frequency to 3-4 times daily, lasting up to 10 minutes each episode.",
    medicalHistory: "History of palpitations, prior cardiology evaluation.",
    conversationHistory: [
      {
        timestamp: new Date("2024-01-22T11:00:00"),
        speaker: "Lisa Anderson",
        message: "I need to reschedule my appointment for next week. I'm having worse heart palpitations and think I need to be seen sooner."
      },
      {
        timestamp: new Date("2024-01-22T11:01:00"),
        speaker: "AI Assistant",
        message: "I understand your concern about the worsening palpitations. Let me help you get seen sooner. Can you describe what's different about these episodes?"
      },
      {
        timestamp: new Date("2024-01-22T11:02:00"),
        speaker: "Lisa Anderson",
        message: "They're happening more often, maybe 3-4 times a day, and they last longer - sometimes 10 minutes."
      },
      {
        timestamp: new Date("2024-01-22T11:02:30"),
        speaker: "AI Assistant",
        message: "That's important information. I'm flagging this for urgent scheduling and a nurse will call you back within 30 minutes to arrange an earlier appointment."
      }
    ]
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
    createdBy: "Dr. Jennifer Adams",
    status: "active"
  }
]