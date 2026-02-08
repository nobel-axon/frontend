import { useState } from 'react';

type MatchPhase = 'QUEUE' | 'REVEALED' | 'LIVE' | 'SETTLED';

interface MatchData {
  id: string;
  phase: MatchPhase;
  pool: string;
  players: number;
  question?: string;
  gapCountdown?: number;
  answerDeadline?: number;
}

export function CurrentMatch() {
  // State for match data - will be connected to API/WebSocket
  const [match] = useState<MatchData | null>(null);

  if (!match) {
    return (
      <div className="panel h-full">
        <div className="panel-header flex items-center justify-between">
          <span>Current Match</span>
          <span className="text-text-muted">Idle</span>
        </div>
        <div className="p-8 text-center">
          <div className="font-mono text-text-muted mb-1">No active match</div>
          <div className="text-sm text-text-muted">
            Next match starts when agents join the queue
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel h-full">
      <div className="panel-header flex items-center justify-between">
        <span>Current Match</span>
        <span className="font-mono text-accent">#{match.id}</span>
      </div>
      <div className="p-4 space-y-4">
        {/* Phase & Stats */}
        <div className="flex items-center justify-between">
          <PhaseIndicator phase={match.phase} />
          <div className="flex gap-6 font-mono text-sm">
            <div>
              <span className="text-text-muted">POOL: </span>
              <span className="font-semibold text-accent">{match.pool} MON</span>
            </div>
            <div>
              <span className="text-text-muted">PLAYERS: </span>
              <span className="font-semibold">{match.players}</span>
            </div>
          </div>
        </div>

        {/* Question */}
        {match.question && (
          <div className="bg-accent-50 rounded-lg p-4">
            <div className="font-mono text-xs text-text-muted uppercase mb-2">
              Question
            </div>
            <div className="font-mono text-lg">{match.question}</div>
          </div>
        )}

        {/* Timers */}
        <div className="flex gap-4">
          {match.gapCountdown !== undefined && (
            <Timer label="GAP ENDS IN" seconds={match.gapCountdown} />
          )}
          {match.answerDeadline !== undefined && (
            <Timer label="ANSWER DEADLINE" seconds={match.answerDeadline} />
          )}
        </div>
      </div>
    </div>
  );
}

interface PhaseIndicatorProps {
  phase: MatchPhase;
}

function PhaseIndicator({ phase }: PhaseIndicatorProps) {
  const colors: Record<MatchPhase, string> = {
    QUEUE: 'text-text-muted',
    REVEALED: 'text-warning',
    LIVE: 'text-success',
    SETTLED: 'text-text-secondary',
  };

  return (
    <div className={`font-mono text-sm font-semibold ${colors[phase]}`}>
      ● {phase}
    </div>
  );
}

interface TimerProps {
  label: string;
  seconds: number;
}

function Timer({ label, seconds }: TimerProps) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="flex-1 bg-accent-50 rounded-lg p-3">
      <div className="font-mono text-xs text-text-muted uppercase mb-1">
        {label}
      </div>
      <div className="font-mono text-xl font-bold text-accent">{display}</div>
    </div>
  );
}
