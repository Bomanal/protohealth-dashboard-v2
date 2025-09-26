import { useState, useCallback } from 'react';
import { FlowMonitorState, AssessmentState, WebSocketMessage, ActivityLogEntry } from '@/types/inbound-monitor';

export const useInboundFlowMonitor = () => {
  const [currentState, setCurrentState] = useState<FlowMonitorState | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('Received data:', message);
    
    if (message.type === 'initial_state' || message.type === 'state_update') {
      setCurrentState(message.data);
      
      // Add to activity log
      const timestamp = new Date(message.data.timestamp).toLocaleTimeString();
      const context = message.data.context || 'state_update';
      
      setActivityLog(prev => {
        const newEntry = {
          timestamp,
          context,
          data: message.data
        };
        
        const updatedLog = [newEntry, ...prev];
        // Keep only last 20 entries
        return updatedLog.slice(0, 20);
      });
    }
  }, []);

  const getAssessmentState = (): AssessmentState | null => {
    return currentState?.assessment_state || null;
  };

  const getMetrics = () => {
    const assessmentState = getAssessmentState();
    return assessmentState?._metrics || {
      active_threads_count: 0,
      asked_questions_count: 0,
      conversation_turns: 0,
      current_node: '-'
    };
  };

  const getActiveThreads = (): string[] => {
    const assessmentState = getAssessmentState();
    return assessmentState?.active_threads || [];
  };

  const getConversationLog = () => {
    const assessmentState = getAssessmentState();
    return assessmentState?.conversation_log || [];
  };

  const getProtocolInfo = () => {
    const assessmentState = getAssessmentState();
    return {
      protocol_id: assessmentState?.protocol_id,
      protocol_name: assessmentState?.triage_protocol_name,
      current_question: assessmentState?.current_protocol_question,
      current_node_id: assessmentState?.current_question_node_id
    };
  };

  const getCurrentStateInfo = () => {
    const assessmentState = getAssessmentState();
    return {
      current_thread_type: assessmentState?.current_thread_type,
      current_question_node: assessmentState?.current_question_node_id,
      protocol_id: assessmentState?.protocol_id,
      triage_protocol: assessmentState?.triage_protocol_name,
      patient: assessmentState?.user_name,
      complaint: assessmentState?.current_complaint
    };
  };

  return {
    currentState,
    activityLog,
    handleWebSocketMessage,
    getAssessmentState,
    getMetrics,
    getActiveThreads,
    getConversationLog,
    getProtocolInfo,
    getCurrentStateInfo
  };
};
