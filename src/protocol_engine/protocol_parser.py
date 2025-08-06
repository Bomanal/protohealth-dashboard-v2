import json
import os
import google.generativeai as genai
from dotenv import load_dotenv
import datetime
from sqlalchemy import text
from sqlalchemy.orm import Session

from src.models import (
    TriageProtocolsList, ProtocolThreads, Nodes, 
    ThreadNodeValues, ThreadOutcomes, NodeValuesQuestionsJson
)
from database import get_db

# Load environment variables
load_dotenv(".env.local")

class ProtocolParser:
    def __init__(self, protocol: TriageProtocolsList, uploaded_file_content: str):
        self.protocol = protocol
        self.uploaded_file_content = uploaded_file_content
        
        # Initialize Gemini API
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in .env file.")
        
        genai.configure(api_key=api_key)
        self.model_name = "gemini-2.5-pro"
        self.llm_model = genai.GenerativeModel(self.model_name)
    
    def parse(self):
        """
        Main method to parse the protocol and save to database
        """
        db_session = next(get_db())
        
        try:
            # Check if protocol already exists
            existing = db_session.query(TriageProtocolsList).filter_by(
                protocol_name=self.protocol.protocol_name
            ).first()
            
            if existing:
                print(f"❌ Protocol '{self.protocol.protocol_name}' already exists with ID {existing.protocol_id}")
                return {"success": False, "message": "Protocol already exists"}
            
            print(f"🚀 Processing protocol: {self.protocol.protocol_name}")
            print("=" * 60)
            
            # Step 1: Create main protocol entry
            protocol_id = self._create_protocol_entry(db_session)
            
            # Step 2: Extract and save nodes
            nvq_data, node_mapping = self._extract_and_save_nodes(
                db_session, protocol_id
            )
            
            if not nvq_data:
                print("❌ Failed to extract nodes. Aborting.")
                db_session.rollback()
                return {"success": False, "message": "Failed to extract nodes"}
            
            # Step 3: Extract thread outcomes
            outcomes_data = self._extract_thread_outcomes(db_session, protocol_id)
            
            if not outcomes_data:
                print("❌ Failed to extract thread outcomes. Aborting.")
                db_session.rollback()
                return {"success": False, "message": "Failed to extract thread outcomes"}
            
            # Step 4: Create protocol threads
            self._create_protocol_threads(
                db_session, protocol_id, nvq_data, outcomes_data, node_mapping
            )
            
            print("=" * 60)
            print(f"🎉 Successfully processed protocol '{self.protocol.protocol_name}' (ID: {protocol_id})")
            print(f"   - Nodes: {len(node_mapping)}")
            print(f"   - Thread Outcomes: {len(outcomes_data)}")
            print(f"   - Protocol Threads: Created with normalized schema")
            
            return {
                "success": True, 
                "protocol_id": protocol_id,
                "nodes_count": len(node_mapping),
                "outcomes_count": len(outcomes_data)
            }
            
        except Exception as e:
            print(f"❌ Error processing protocol '{self.protocol.protocol_name}': {e}")
            db_session.rollback()
            return {"success": False, "message": str(e)}
        finally:
            db_session.close()
    
    def _call_llm(self, prompt_parts):
        """Handles the LLM API request and returns the model's text response."""
        try:
            response = self.llm_model.generate_content(prompt_parts)
            response_text = response.text
            
            # Strip markdown code block wrappers if present
            if response_text.startswith("```json") and response_text.endswith("```"):
                response_text = response_text[7:-3].strip()
            elif response_text.startswith("```") and response_text.endswith("```"):
                response_text = response_text[3:-3].strip()
            
            return response_text
        except Exception as e:
            print(f"Error calling LLM: {e}")
            return None
    
    def _get_next_protocol_id(self, session: Session):
        """Get the next available protocol ID from database"""
        result = session.execute(text("SELECT MAX(CAST(SUBSTRING(protocol_id, 2) AS INTEGER)) FROM triage_protocols_list"))
        max_id = result.scalar()
        return f"P{(max_id or 0) + 1:03d}"
    
    def _get_next_node_id(self, session: Session):
        """Get the next available node ID from database"""
        result = session.execute(text("SELECT MAX(CAST(SUBSTRING(node_id, 2) AS INTEGER)) FROM nodes"))
        max_id = result.scalar()
        return f"N{(max_id or 0) + 1:03d}"
    
    def _get_next_thread_id(self, session: Session):
        """Get the next available thread ID from database"""
        result = session.execute(text("SELECT MAX(CAST(SUBSTRING(thread_id, 2) AS INTEGER)) FROM protocol_threads"))
        max_id = result.scalar()
        return f"T{(max_id or 0) + 1:03d}"
    
    def _get_or_create_node_id(self, session: Session, node_name: str, node_mapping: dict, node_data: dict):
        """Get existing node ID or create new one for a node name"""
        if node_name in node_mapping:
            return node_mapping[node_name]
        
        # Check if node already exists in database
        existing = session.query(Nodes).filter_by(node_name=node_name).first()
        if existing:
            node_mapping[node_name] = existing.node_id
            return existing.node_id
        
        # Create new node ID and Node record
        new_node_id = self._get_next_node_id(session)
        node_mapping[node_name] = new_node_id
        
        # Create the Node record in the nodes table
        node = Nodes(
            node_id=new_node_id,
            question=node_data.get('question', ''),
            node_name=node_name,
            node_category=node_data.get('node_category', '')
        )
        session.add(node)
        session.flush()  # Ensure node exists before it's referenced
        
        return new_node_id
    
    def _create_protocol_entry(self, session: Session):
        """Create the main protocol entry with generated description"""
        # Generate protocol ID
        protocol_id = self._get_next_protocol_id(session)
        
        # Generate description using LLM
        desc_prompt = f"""
        Generate a comprehensive description for this clinical protocol in maximum 100 words.
        Include key assessment criteria, patient symptoms, and typical patient descriptions.
        Use phrases that patients typically use to describe their symptoms.
        
        Protocol Name: {self.protocol.protocol_name}
        Protocol Content: {self.uploaded_file_content[:1000]}...
        
        Output only the description text, no quotes or formatting.
        """
        
        print(f"Creating protocol {protocol_id} - {self.protocol.protocol_name}...")
        description = self._call_llm([desc_prompt])
        
        if not description:
            description = f"Clinical protocol for {self.protocol.protocol_name.replace('_', ' ').lower()}"
        
        # Update the existing protocol object with ID and description
        self.protocol.protocol_id = protocol_id
        self.protocol.protocol_description = description.strip()
        
        # Add to session and commit
        session.add(self.protocol)
        session.commit()
        
        print(f"✅ Created protocol entry: {protocol_id}")
        return protocol_id
    
    def _extract_and_save_nodes(self, session: Session, protocol_id: str):
        """Extract Node-Values-Questions and save to new normalized schema"""
        prompt = f"""
        You are a General Physician and a clinical informatics expert. Analyze the provided clinical guidance document to extract:
        1. Clinical Nodes (concepts) based on the categories below
        2. Possible Values for each Node as mentioned in the protocol or clinical guidelines
        3. Questions associated with each Node. The questions should be in the form of a question that a General Physician would ask a patient.
        
        Use this clinical node categories table for reference:
        
        | Node Category | SNOMED nomenclature | Explanation | Examples |
        | :---- | :---- | :---- | :---- |
        | **Body Structure** | Body structure | Represents a specific anatomical part, region, or location on or within the human body. | Head (body structure), Structure of lung (body structure) |
        | **Symptoms** | Clinical finding | Encompasses subjective patient complaints (symptoms), objective provider observations (signs). | Headache (finding), Fever (finding) |
        | **Visual Finding** | Clinical finding | Specifies a clinical finding related to the patient's or body part appearance | Blurred vision (finding), Diplopia (finding) (double vision), size of injury, depth of cut |
        | **Temporal Attribute** | Qualifier value | A qualifier describing the time-related characteristics of a clinical event, such as its onset or course. | Acute onset (qualifier value), Chronic (qualifier value), Intermittent, 2 days, 4 hours |
        | **Historical Context** | Situation with explicit context | Captures relevant past medical events, family history, or social circumstances that provide context to the current presentation. | History of migraine (situation), Family history of stroke (situation) |
        | **Causative Event** | Event | Represents an external event, injury, or exposure suspected to be the cause of or associated with the patient's condition. | Motor vehicle accident (event), Fall from height (event), Sharp object piercing |
        | **Patient Demographics** | Qualifier value | Baseline, non-clinical, and identifying information about the patient, crucial for risk stratification. | Age, Gender, Pregnancy status (finding) |
        | **Lifestyle and Behavioral Factor** | Finding / Observable entity | Describes patient behaviors or habits that can act as risk factors, triggers, or exacerbating factors. | Tobacco smoker (finding), Alcohol consumption (observable entity) |
        | **Medication Exposure** | Pharmaceutical / biologic product | Documents the patient's current or recent use of prescribed drugs, over-the-counter products, or supplements. | Taking anticoagulant drug (finding), History of use of immunosuppressant |
        | **Prior Intervention** | Procedure | Represents a specific action taken in clinical or non-clinical setting, especially any home care already done | Paracetamol taken, Cold Shower taken, First aid done on injurr |
        | **Diagnostic Finding** | Clinical finding | Represents the objective outcome of a diagnostic test, including lab results, imaging, or physiological measurements. | White blood cell count above reference range, Lesion on MRI |
        | **Vital Signs** | Observable entity | Objective, fundamental measurements of the body's basic functions, providing a real-time snapshot of physiological status. | Blood pressure, Heart rate, Body temperature, Oxygen saturation |
        | **Allergy and Adverse Reaction** | Finding / Situation | Captures known allergies to substances or previous adverse reactions, a critical safety factor. | Allergy to penicillin (finding), History of anaphylaxis (situation) |
        | **Psychosocial Context** | Finding / Situation | Encompasses the patient's mental, emotional, and social well-being, which can influence or manifest as physical symptoms. | High stress level (finding), History of depression (situation), Lives alone |
        | **Functional Status** | Finding | Assesses the impact of the health condition on the patient's ability to perform daily activities. | Impaired mobility (finding), Unable to perform activities of daily living, Bedridden |
        | **Environmental Exposure** | Event / Finding | Captures potential health risks related to a patient's work, living environment, or travel history. | Occupational exposure to asbestos (event), Recent travel to endemic area |
        
        Return a JSON array with objects containing:
        - "node_name": string (clinical concept name)
        - "node_category": string (from clinical categories above)
        - "snomed_nomenclature": string (SNOMED classification)
        - "question": string (question to ask patient)
        - "possible_values": array of strings (possible answer values)
        
        Clinical Guidance Document:
        ---
        {self.uploaded_file_content}
        ---
        
        Output only the JSON array, no other text.
        """
        
        print("Extracting Node-Values-Questions...")
        response = self._call_llm([prompt])
        
        if not response:
            print("Failed to extract Node-Values-Questions")
            return [], {}
        
        try:
            nvq_data = json.loads(response)
            node_mapping = {}
            
            # Process each node - create Node records in nodes table
            for node_data in nvq_data:
                node_name = node_data.get('node_name', '')
                node_id = self._get_or_create_node_id(session, node_name, node_mapping, node_data)
            
            # Save the JSON version for reference
            nvq_json = NodeValuesQuestionsJson(
                protocol_name_from_file=self.protocol.protocol_name,
                protocol_id=protocol_id,
                json_data=json.dumps(nvq_data)  # Convert to JSON string
            )
            session.add(nvq_json)
            
            session.commit()
            print(f"✅ Created {len(nvq_data)} nodes")
            return nvq_data, node_mapping
            
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing Node-Values-Questions JSON: {e}")
            session.rollback()
            return [], {}
    
    def _extract_thread_outcomes(self, session: Session, protocol_id: str):
        """Extract medical conditions/outcomes from the protocol"""
        prompt = f"""
        Analyze this clinical protocol and extract medical conditions with their triage decisions and home care advice.
        
        Return a JSON array with objects containing:
        - "final_condition": string (medical condition name)
        - "triage_outcome": string (Call ED, Call 911, refer to another protocol, etc.)
        - "home_care_advice": string (optional, often indicated by CA numbers)
        
        Clinical Guidance Document:
        ---
        {self.uploaded_file_content}
        ---
        
        Output only the JSON array, no other text.
        """
        
        print("Extracting thread outcomes...")
        response = self._call_llm([prompt])
        
        if not response:
            print("Failed to extract thread outcomes")
            return []
        
        try:
            outcomes_data = json.loads(response)
            print(f"✅ Extracted {len(outcomes_data)} thread outcomes")
            return outcomes_data
            
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing thread outcomes JSON: {e}")
            return []
    
    def _create_protocol_threads(self, session: Session, protocol_id: str, nvq_data: list, outcomes_data: list, node_mapping: dict):
        """Create protocol threads using the new normalized schema"""
        
        # Get the current max thread ID once at the beginning
        result = session.execute(text("SELECT MAX(CAST(SUBSTRING(thread_id, 2) AS INTEGER)) FROM protocol_threads"))
        max_thread_id = result.scalar() or 0
        thread_counter = max_thread_id
        
        # Prepare context for LLM
        outcomes_context = "\n".join([
            f"- {outcome['final_condition']}: {outcome['triage_outcome']}" 
            for outcome in outcomes_data
        ])
        
        # Create node context with available values
        nodes_context = {}
        for node_data in nvq_data:
            node_name = node_data['node_name']
            nodes_context[node_name] = {
                'category': node_data['node_category'],
                'question': node_data['question'],
                'values': node_data['possible_values']
            }
        
        prompt = f"""
        Create decision threads that lead to medical conditions using clinical reasoning.
        
        For each medical condition, create a logical clinical pathway using node-value pairs.
        
        Return a JSON array with objects containing:
        - "final_condition": string (must match one from outcomes)
        - "triage_outcome": string (matching triage decision)
        - "home_care_advice": string (optional)
        - "steps": array of objects with:
          - "node_name": string (must match available nodes exactly)
          - "selected_value": string (must be from the node's possible values)
        
        Available Outcomes:
        {outcomes_context}

        Available Nodes and Their Possible Values:
        {json.dumps(nodes_context, indent=2)}

        Original Protocol Content:
        ---
        {self.uploaded_file_content}
        ---

        Requirements:
        - Create exactly 1 thread per outcome
        - Use 2-8 steps per thread depending on complexity
        - Emergency conditions should have shorter, more direct paths
        - Each step must use exact node names and values from the available data
        - Steps should follow logical clinical assessment order
        
        Output only the JSON array, no other text.
        """
        
        print("Creating protocol threads...")
        response = self._call_llm([prompt])
        
        if not response:
            print("Failed to create protocol threads")
            return
        
        try:
            threads_data = json.loads(response)
            created_threads = 0
            
            for thread_data in threads_data:
                # Generate unique thread ID using counter
                thread_counter += 1
                thread_id = f"T{thread_counter:03d}"
                
                # Create main protocol thread record
                protocol_thread = ProtocolThreads(
                    thread_id=thread_id,
                    protocol_id=protocol_id
                )
                session.add(protocol_thread)
                session.flush()  # Ensure thread exists before adding related records
                
                # Create thread outcome record
                thread_outcome = ThreadOutcomes(
                    thread_id=thread_id,
                    triage_outcome=thread_data.get('triage_outcome'),
                    home_care_advice=thread_data.get('home_care_advice'),
                    final_condition=thread_data.get('final_condition')
                )
                session.add(thread_outcome)
                
                # Create thread node values (the steps)
                steps = thread_data.get('steps', [])
                for step_data in steps:
                    node_name = step_data.get('node_name', '')
                    selected_value = step_data.get('selected_value', '')
                    
                    # Get node_id from our mapping
                    node_id = node_mapping.get(node_name)
                    if not node_id:
                        print(f"⚠️  Warning: Node '{node_name}' not found in mapping")
                        continue
                    
                    # Create thread node value record
                    thread_node_value = ThreadNodeValues(
                        thread_id=thread_id,
                        node_id=node_id,
                        node_value=selected_value
                    )
                    session.add(thread_node_value)
                
                created_threads += 1
                print(f"  ✅ Created thread {thread_id} for '{thread_data.get('final_condition')}' with {len(steps)} steps")
            
            session.commit()
            print(f"🎉 Successfully created {created_threads} protocol threads")
            
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing protocol threads JSON: {e}")
            session.rollback()
        except Exception as e:
            print(f"❌ Error creating protocol threads: {e}")
            session.rollback()
