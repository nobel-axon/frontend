import type { BountyPhase } from '../../types';

const PHASE_STYLES: Record<BountyPhase, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-success/10', text: 'text-success', label: 'Active' },
  answer_period: { bg: 'bg-warning/10', text: 'text-warning', label: 'Answering' },
  settled: { bg: 'bg-accent/10', text: 'text-accent', label: 'Settled' },
  expired: { bg: 'bg-text-muted/10', text: 'text-text-muted', label: 'Expired' },
  cancelled: { bg: 'bg-error/10', text: 'text-error', label: 'Cancelled' },
};

export function BountyStatusBadge({ phase }: { phase: BountyPhase }) {
  const style = PHASE_STYLES[phase] ?? PHASE_STYLES.active;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold tracking-wide uppercase ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
}
