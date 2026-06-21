import { cn } from '@/lib/utils';

export type PresenceStatus = 'online' | 'away' | 'offline' | 'directory';

export interface PresenceInfo {
  status: PresenceStatus;
  label: string;
  isOnline: boolean;
  lastSeenAt: string | null;
}

interface PresenceIndicatorProps {
  presence: PresenceInfo;
  className?: string;
  showLabel?: boolean;
}

const DOT: Record<PresenceStatus, string> = {
  online: 'bg-emerald-500',
  away: 'bg-amber-400',
  offline: 'bg-muted-foreground/40',
  directory: 'bg-sky-500',
};

export function PresenceIndicator({
  presence,
  className,
  showLabel = true,
}: PresenceIndicatorProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-xs', className)}
      title={
        presence.lastSeenAt
          ? `Última actividad: ${new Date(presence.lastSeenAt).toLocaleString('es-AR')}`
          : presence.label
      }
    >
      <span
        className={cn('h-2 w-2 shrink-0 rounded-full', DOT[presence.status])}
        aria-hidden
      />
      {showLabel && (
        <span
          className={cn(
            presence.status === 'online' ? 'font-medium text-emerald-700' : 'text-muted-foreground',
          )}
        >
          {presence.label}
        </span>
      )}
    </span>
  );
}
