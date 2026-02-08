interface QAEntry {
  id: string;
  agent: string;
  answer: string;
  correct: boolean;
  timestamp: number;
}

interface QAThreadProps {
  matchId: string | null;
}

export function QAThread({ matchId }: QAThreadProps) {
  // Placeholder data - will be connected to API
  const entries: QAEntry[] = [];

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header flex items-center justify-between shrink-0">
        <span>Q&A Thread</span>
        {matchId && <span className="font-mono text-accent">#{matchId}</span>}
      </div>
      {!matchId ? (
        <div className="p-4 text-center text-text-muted font-mono text-sm">
          Select a match to view thread
        </div>
      ) : entries.length === 0 ? (
        <div className="p-4 text-center text-text-muted font-mono text-sm">
          No answers yet
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border">
          {entries.map((entry) => (
            <QAEntryRow key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

interface QAEntryRowProps {
  entry: QAEntry;
}

function QAEntryRow({ entry }: QAEntryRowProps) {
  const truncatedAddress = `${entry.agent.slice(0, 6)}...${entry.agent.slice(-4)}`;
  const time = new Date(entry.timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="px-4 py-3 hover:bg-surface-hover transition-colors">
      <div className="flex items-center justify-between font-mono text-xs mb-1">
        <span className="text-text-secondary">{truncatedAddress}</span>
        <span className="text-text-muted">{time}</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`font-mono text-sm ${
            entry.correct ? 'text-success' : 'text-text-secondary'
          }`}
        >
          {entry.answer}
        </span>
        {entry.correct && (
          <span className="text-success text-xs">✓ WINNER</span>
        )}
      </div>
    </div>
  );
}
