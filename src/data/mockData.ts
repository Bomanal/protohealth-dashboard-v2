import { PatientInteraction, OutboundFlow, TriageProtocol } from "@/types/healthcare"

export const mockPatientInteractions: PatientInteraction[] = [
  {
    id: "1",
    patientName: "Sarah Johnson",
    patientId: "PT-2024-001",
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
    preliminaryDiagnosis: "Possible post-procedural complications",
    triageOutcome: "Escalate to cardiologist",
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
    dateOfBirth: "1982-11-08",
    callNumber: 1,
    status: "message_sent",
    source: "outbound_flow",
    sourceDetail: "Pre-Endoscopy Preparation",
    timestamp: new Date("2024-01-22T07:45:00"),
    lastContact: new Date("2024-01-22T07:45:00"),
    priority: "medium",
    department: "gastroenterology",
    notes: "Automated message sent with prep instructions. Patient confirmed receipt via text.",
    preliminaryDiagnosis: "Endoscopy preparation",
    triageOutcome: "In queue",
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
  },
  {
    id: "6",
    patientName: "James Wilson",
    patientId: "PT-2024-006",
    dateOfBirth: "1948-12-11",
    callNumber: 1,
    status: "engaged",
    source: "outbound_flow",
    sourceDetail: "Heart Failure Management Check-in",
    timestamp: new Date("2024-01-22T06:30:00"),
    lastContact: new Date("2024-01-22T06:30:00"),
    priority: "medium",
    department: "cardiology",
    notes: "Weekly check-in completed. Patient reports stable symptoms, good medication compliance.",
    preliminaryDiagnosis: "Heart failure - stable",
    triageOutcome: "Completed",
    conversationHistory: [
      {
        timestamp: new Date("2024-01-22T06:30:00"),
        speaker: "AI Assistant",
        message: "Good morning Mr. Wilson! This is your weekly heart failure check-in. How have you been feeling this week?"
      },
      {
        timestamp: new Date("2024-01-22T06:31:00"),
        speaker: "James Wilson",
        message: "Pretty good overall. No major changes."
      },
      {
        timestamp: new Date("2024-01-22T06:31:30"),
        speaker: "AI Assistant",
        message: "Great to hear! Let's go through our usual questions. Have you weighed yourself daily? Any weight gain of 2 pounds or more?"
      },
      {
        timestamp: new Date("2024-01-22T06:32:00"),
        speaker: "James Wilson",
        message: "Yes, I weigh myself every morning. No significant changes - stayed between 185-187 all week."
      },
      {
        timestamp: new Date("2024-01-22T06:33:00"),
        speaker: "AI Assistant",
        message: "Excellent! How about shortness of breath or swelling in your legs?"
      },
      {
        timestamp: new Date("2024-01-22T06:33:30"),
        speaker: "James Wilson",
        message: "No new shortness of breath, and the ankle swelling is about the same as usual."
      },
      {
        timestamp: new Date("2024-01-22T06:34:00"),
        speaker: "AI Assistant",
        message: "Perfect. Are you taking all your medications as prescribed?"
      },
      {
        timestamp: new Date("2024-01-22T06:34:30"),
        speaker: "James Wilson",
        message: "Yes, every day. The pill organizer really helps."
      },
      {
        timestamp: new Date("2024-01-22T06:35:00"),
        speaker: "AI Assistant",
        message: "Wonderful! Your heart failure management is going very well. Continue with your current plan and I'll check in again next Monday."
      }
    ]
  },
  {
    id: "7",
    patientName: "Maria Garcia",
    patientId: "PT-2024-007",
    dateOfBirth: "1963-06-25",
    callNumber: 1,
    status: "scheduled",
    source: "inbound_scheduling",
    timestamp: new Date("2024-01-22T09:45:00"),
    notes: "Successfully scheduled for upper endoscopy with pre-procedure prep education completed",
    priority: "low",
    department: "gastroenterology",
    preliminaryDiagnosis: "Routine endoscopy",
    triageOutcome: "Completed",
    conversationHistory: [
      {
        timestamp: new Date("2024-01-22T09:45:00"),
        speaker: "Maria Garcia",
        message: "I need to schedule an upper endoscopy. My doctor said I should call."
      },
      {
        timestamp: new Date("2024-01-22T09:45:30"),
        speaker: "AI Assistant",
        message: "I'd be happy to help you schedule that. Let me check Dr. Patel's availability. Do you have any preferred dates or times?"
      },
      {
        timestamp: new Date("2024-01-22T09:46:00"),
        speaker: "Maria Garcia",
        message: "Morning times work better for me, preferably next week."
      },
      {
        timestamp: new Date("2024-01-22T09:46:30"),
        speaker: "AI Assistant",
        message: "I have Tuesday at 8 AM or Thursday at 9:30 AM available. Which would you prefer?"
      },
      {
        timestamp: new Date("2024-01-22T09:47:00"),
        speaker: "Maria Garcia",
        message: "Thursday at 9:30 works perfectly."
      },
      {
        timestamp: new Date("2024-01-22T09:47:30"),
        speaker: "AI Assistant",
        message: "Perfect! You're scheduled for Thursday, January 25th at 9:30 AM. I'll send you preparation instructions and a reminder call the day before."
      }
    ]
  },
  {
    id: "8",
    patientName: "David Thompson",
    patientId: "PT-2024-008",
    dateOfBirth: "1960-01-19",
    callNumber: 1,
    status: "message_sent",
    source: "outbound_flow",
    sourceDetail: "Post-Surgery Recovery Instructions",
    timestamp: new Date("2024-01-22T08:00:00"),
    priority: "medium",
    department: "gastroenterology",
    notes: "Post-operative care instructions delivered. Patient acknowledged understanding of diet restrictions and follow-up schedule.",
    preliminaryDiagnosis: "Post-surgical recovery",
    triageOutcome: "In queue",
    conversationHistory: [
      {
        timestamp: new Date("2024-01-22T08:00:00"),
        speaker: "AI Assistant",
        message: "Good morning David! This is NurseAssist AI following up on your procedure yesterday. How are you feeling today?"
      },
      {
        timestamp: new Date("2024-01-22T08:01:00"),
        speaker: "David Thompson",
        message: "I'm feeling okay, just a little sore."
      },
      {
        timestamp: new Date("2024-01-22T08:01:30"),
        speaker: "AI Assistant",
        message: "That's normal after your procedure. For the next 24 hours, please stick to clear liquids, then advance to soft foods tomorrow. Avoid heavy lifting for one week."
      },
      {
        timestamp: new Date("2024-01-22T08:02:00"),
        speaker: "David Thompson",
        message: "Got it. When should I follow up?"
      },
      {
        timestamp: new Date("2024-01-22T08:02:30"),
        speaker: "AI Assistant",
        message: "Your follow-up appointment is scheduled for next Friday. I'll send you a confirmation text. Call if you experience severe pain, fever, or unusual symptoms."
      }
    ]
  },
  {
    id: "9",
    patientName: "Dr. Patricia Kim",
    patientId: "PT-2024-009",
    dateOfBirth: "1985-08-14",
    callNumber: 1,
    status: "engaged",
    source: "inbound_phone",
    timestamp: new Date("2024-01-22T14:30:00"),
    lastContact: new Date("2024-01-22T14:30:00"),
    notes: "Physician calling about patient care coordination. Successfully connected to on-call cardiologist.",
    priority: "high",
    department: "cardiology",
    preliminaryDiagnosis: "Physician consultation",
    triageOutcome: "Completed",
    conversationHistory: [
      {
        timestamp: new Date("2024-01-22T14:30:00"),
        speaker: "Dr. Patricia Kim",
        message: "This is Dr. Kim from Emergency. I have a patient here with chest pain and I need to speak with cardiology about urgent cath lab activation."
      },
      {
        timestamp: new Date("2024-01-22T14:30:30"),
        speaker: "AI Assistant",
        message: "Dr. Kim, I'm connecting you immediately to Dr. Martinez, our on-call interventional cardiologist. Please hold while I patch you through."
      }
    ]
  },
  {
    id: "10",
    patientName: "Nancy Rodriguez",
    patientId: "PT-2024-010",
    dateOfBirth: "1952-05-03",
    callNumber: 2,
    status: "needs_action",
    source: "outbound_flow", 
    sourceDetail: "Medication Adherence Check",
    timestamp: new Date("2024-01-22T16:00:00"),
    lastContact: new Date("2024-01-22T16:00:00"),
    notes: "Patient reports missing multiple doses of heart medication due to cost concerns. Requires social work consultation.",
    priority: "high",
    department: "cardiology",
    preliminaryDiagnosis: "Medication non-adherence",
    triageOutcome: "Needs action",
    conversationHistory: [
      {
        timestamp: new Date("2024-01-22T16:00:00"),
        speaker: "AI Assistant",
        message: "Hello Mrs. Rodriguez! This is your monthly medication check-in. Are you taking all your heart medications as prescribed?"
      },
      {
        timestamp: new Date("2024-01-22T16:01:00"),
        speaker: "Nancy Rodriguez",
        message: "I've been trying to, but I ran out of two of them last week and haven't been able to refill them."
      },
      {
        timestamp: new Date("2024-01-22T16:01:30"),
        speaker: "AI Assistant",
        message: "I'm sorry to hear that. Can you tell me which medications you're unable to refill?"
      },
      {
        timestamp: new Date("2024-01-22T16:02:00"),
        speaker: "Nancy Rodriguez",
        message: "The metoprolol and the Lipitor. They're just too expensive right now."
      },
      {
        timestamp: new Date("2024-01-22T16:02:30"),
        speaker: "AI Assistant",
        message: "I understand how challenging medication costs can be. I'm connecting you with our financial counselor who can help with patient assistance programs. This is very important for your heart health."
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
