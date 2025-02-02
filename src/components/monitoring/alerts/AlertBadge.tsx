import { Alert } from '@/lib/monitoring/alerts/alert-manager';

interface AlertBadgeProps {
  severity: Alert['severity'];
  count?: number;
}

export function AlertBadge({ severity, count }: AlertBadgeProps) {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
  const severityClasses = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800"
  };
  return (
    <span className={`${baseClasses} ${severityClasses[severity as keyof typeof severityClasses]}`}>
      {count !== undefined ? (
        <span className="flex items-center space-x-1">
          <span>{severity}</span>
          <span className="px-1.5 py-0.5 bg-white bg-opacity-25 rounded-full">
            {count}
          </span>
        </span>
      ) : (
        severity
      )}
    </span>
  );
} 