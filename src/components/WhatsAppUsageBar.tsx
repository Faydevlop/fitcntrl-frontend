import { Progress } from '@/components/ui/progress';

interface WhatsAppUsageBarProps {
  used: number;
  limit: number;
  showLabel?: boolean;
  className?: string;
}

const WhatsAppUsageBar = ({ used, limit, showLabel = true, className = '' }: WhatsAppUsageBarProps) => {
  const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
  const clampedPct = Math.min(pct, 100);

  const colorClass =
    pct > 80 ? 'bg-destructive' : pct >= 60 ? 'bg-warning' : 'bg-success';

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 rounded-full bg-muted">
          <div
            className={`h-2 rounded-full transition-all ${colorClass}`}
            style={{ width: `${clampedPct}%` }}
          />
        </div>
        {showLabel && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">{pct}%</span>
        )}
      </div>
    </div>
  );
};

export default WhatsAppUsageBar;
