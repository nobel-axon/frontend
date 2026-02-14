const PHASE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Pending' },
  open: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Open' },
  active: { bg: 'bg-success/10', text: 'text-success', label: 'Active' },
  settled: { bg: 'bg-accent/10', text: 'text-accent', label: 'Settled' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Rejected' },
  refunded: { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'Refunded' },
  expired: { bg: 'bg-text-muted/10', text: 'text-text-muted', label: 'Expired' },
};

export function BountyStatusBadge({ phase, expiresAt }: { phase: string; expiresAt?: string }) {
  const derived =
    phase === 'active' && expiresAt && new Date(expiresAt).getTime() < Date.now()
      ? 'expired'
      : phase;
  const style = PHASE_STYLES[derived] ?? PHASE_STYLES.active;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold tracking-wide uppercase ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
}
