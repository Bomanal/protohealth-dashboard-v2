import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { ConnectionStatus as ConnectionStatusType } from '@/types/inbound-monitor';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const getStatusIcon = () => {
    if (status.connected) {
      return <Wifi className="h-3 w-3" />;
    } else if (status.reconnecting) {
      return <Loader2 className="h-3 w-3 animate-spin" />;
    } else {
      return <WifiOff className="h-3 w-3" />;
    }
  };

  const getStatusText = () => {
    if (status.connected) {
      return 'Connected';
    } else if (status.reconnecting) {
      return 'Reconnecting...';
    } else {
      return 'Disconnected';
    }
  };

  const getStatusColor = () => {
    if (status.connected) {
      return 'text-green-500';
    } else if (status.reconnecting) {
      return 'text-yellow-500';
    } else {
      return 'text-red-500';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${getStatusColor()}`}>
        {getStatusIcon()}
      </div>
      <span className="text-sm font-medium">
        {getStatusText()}
      </span>
      {status.error && (
        <span className="text-xs text-red-500 ml-2">
          ({status.error})
        </span>
      )}
    </div>
  );
}
