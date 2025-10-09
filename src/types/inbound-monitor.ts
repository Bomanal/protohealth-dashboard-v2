export interface FlowMonitorState {
  timestamp: string;
  context: string;
  assessment_state: AssessmentState;
  full_state_keys: string[];
}

export interface AssessmentState {
  protocol_id?: string;
  active_threads?: string[];
  asked_questions?: string[];
  current_thread_type?: string;
  current_question_node_id?: string;
  current_protocol_question?: string;
  user_name?: string;
  phone_number?: string;
  current_complaint?: string;
  triage_protocol_name?: string;
  conversation_log?: ConversationTurn[];
  final_condition?: string;
  triage_outcome?: string;
  previous_thread_type?: string;
  transition_message?: string;
  _metrics?: Metrics;
}

export interface ConversationTurn {
  role: 'assistant' | 'user';
  content: string;
}

export interface Metrics {
  active_threads_count: number;
  asked_questions_count: number;
  conversation_turns: number;
  current_node: string;
}

export interface WebSocketMessage {
  type: 'initial_state' | 'state_update';
  data: FlowMonitorState;
}

export interface ThreadCondition {
  threadId: string;
  conditionName: string;
}

export interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  error?: string;
}

export interface ActivityLogEntry {
  timestamp: string;
  context: string;
  data: FlowMonitorState;
}
