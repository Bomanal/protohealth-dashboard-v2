import { useState, useEffect } from 'react';

interface ProtocolNameItem {
  protocol_id: string;
  protocol_name: string;
  protocol_description: string;
}

export function useProtocols() {
  const [protocols, setProtocols] = useState<ProtocolNameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        const response = await fetch('/protocol-names');
        if (!response.ok) {
          throw new Error('Failed to fetch protocols');
        }
        const data = await response.json();
        setProtocols(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProtocols();
  }, []);

  return { protocols, loading, error };
}
