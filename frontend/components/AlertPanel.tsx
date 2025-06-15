'use client';

import { AlertTriangleIcon, InfoIcon, XIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import { SystemAlert } from '@/types';
import { formatTimestamp, cn } from '@/lib/utils';

interface AlertPanelProps {
  alerts: SystemAlert[];
  onDismissAlert: (alertId: string) => void;
}

export default function AlertPanel({ alerts, onDismissAlert }: AlertPanelProps) {
  const getAlertIcon = (type: SystemAlert['type']) => {
    switch (type) {
      case 'info':
        return InfoIcon;
      case 'success':
        return CheckCircleIcon;
      case 'warning':
        return AlertTriangleIcon;
      case 'error':
        return AlertCircleIcon;
      default:
        return InfoIcon;
    }
  };

  const getAlertColor = (type: SystemAlert['type']) => {
    switch (type) {
      case 'info':
        return 'text-tactical-400 bg-tactical-900/20 border-tactical-600';
      case 'success':
        return 'text-success-400 bg-success-900/20 border-success-600';
      case 'warning':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-600';
      case 'error':
        return 'text-danger-400 bg-danger-900/20 border-danger-600';
      default:
        return 'text-military-400 bg-military-700 border-military-600';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <AlertTriangleIcon className="w-4 h-4 text-military-400" />
          <h3 className="text-sm font-medium text-military-300">System Alerts</h3>
        </div>
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-military-700 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircleIcon className="w-6 h-6 text-success-400" />
          </div>
          <p className="text-sm text-military-400">All systems operational</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-h-64 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangleIcon className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-medium text-military-300">System Alerts</h3>
        </div>
        <span className="text-xs text-military-400">{alerts.length} active</span>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => {
          const AlertIcon = getAlertIcon(alert.type);
          const alertColor = getAlertColor(alert.type);

          return (
            <div
              key={alert.id}
              className={cn(
                "p-3 rounded-lg border text-sm",
                alertColor
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2 flex-1">
                  <AlertIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-xs mt-1 opacity-90">{alert.message}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {formatTimestamp(alert.timestamp)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => onDismissAlert(alert.id)}
                  className="p-1 hover:bg-military-600 rounded transition-colors flex-shrink-0"
                  title="Dismiss alert"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </div>

              {/* Alert Actions */}
              {alert.actions && alert.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {alert.actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={action.handler}
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium transition-colors",
                        action.type === 'primary' && "bg-tactical-600 hover:bg-tactical-700 text-white",
                        action.type === 'secondary' && "bg-military-600 hover:bg-military-500 text-white",
                        action.type === 'danger' && "bg-danger-600 hover:bg-danger-700 text-white"
                      )}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 