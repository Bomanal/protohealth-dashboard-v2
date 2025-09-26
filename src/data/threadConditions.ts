export const threadConditions: Record<string, string> = {
  // Headache Protocol (P002) threads
  'T145': 'Subarachnoid Hemorrhage (SAH)',
  'T146': 'Meningitis / Encephalitis',
  'T152': 'Epidural or Subdural Hematoma',
  'T155': 'Acute Angle-Closure Glaucoma',
  'T157': 'Giant Cell Arteritis (GCA)',
  'T161': 'Cerebrospinal Fluid (CSF) Leak',
  'T167': 'Pre-existing Migraine (pattern change)',
  'T168': 'Migraine (previously diagnosed)',
  'T169': 'Tension-type headache',
  
  // Back Pain Protocol (P005) threads
  'T204': 'Bowel or Bladder Incontinence (New)',
  'T205': 'Saddle Anesthesia (Numbness)',
  'T206': 'Severe or Progressive Weakness in legs',
  'T207': 'Back pain from High-Impact Trauma',
  'T208': 'Back pain with History of Cancer',
  'T209': 'Acute Mechanical Back Strain',
  'T210': 'Sciatica (Nerve Root Irritation)',
  'T211': 'Suspected Kidney Stone or Infection',
  
  // Generic/Test threads (commonly used in test data)
  'T001': 'Primary Condition A',
  'T002': 'Secondary Condition B', 
  'T003': 'Tertiary Condition C',
  'T004': 'Additional Condition D',
  'T005': 'Alternative Condition E'
};

export const getThreadConditionName = (threadId: string): string => {
  return threadConditions[threadId] || `Condition ${threadId}`;
};
