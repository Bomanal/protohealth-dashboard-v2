import { useState } from 'react';

interface FinalOutcomeItem {
  thread_id: string;
  final_outcome: string;
}

export function useFinalOutcomes() {
  const [finalOutcomes, setFinalOutcomes] = useState<FinalOutcomeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFinalOutcomes = async (protocolId: string) => {
    if (!protocolId) {
      setFinalOutcomes([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/protocol/${protocolId}/final-outcomes`);
      if (!response.ok) {
        throw new Error('Failed to fetch final outcomes');
      }
      const data = await response.json();
      setFinalOutcomes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setFinalOutcomes([]);
    } finally {
      setLoading(false);
    }
  };

  const clearOutcomes = () => {
    setFinalOutcomes([]);
    setError(null);
  };

  return { 
    finalOutcomes, 
    loading, 
    error, 
    fetchFinalOutcomes, 
    clearOutcomes 
  };
}
