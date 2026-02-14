import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { config } from '../config';
import { MaintenanceBanner } from './MaintenanceBanner';
import { OnboardingFlow } from './OnboardingFlow';
import { ScrambleText } from './ScrambleText';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [onboardingMode, setOnboardingMode] = useState<'full' | 'walkthrough' | 'terms' | 'tutorial'>('full');
  const [onboardingKey, setOnboardingKey] = useState(0);

  const reopenAs = (mode: 'full' | 'walkthrough' | 'terms' | 'tutorial') => {
    setOnboardingMode(mode);
    setOnboardingKey((k) => k + 1);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail === 'full' || detail === 'walkthrough' || detail === 'terms' || detail === 'tutorial') {
        reopenAs(detail);
      }
    };
    window.addEventListener('reopen-onboarding', handler);
    return () => window.removeEventListener('reopen-onboarding', handler);
  }, []);

  return (
    <div className="min-h-screen lg:h-screen flex items-start lg:items-center justify-center p-2 md:p-3 lg:p-5 xl:p-6">
      <div className="floating-container flex flex-col w-full lg:h-full">
        <Header />
        <main className="flex-1 min-h-0 p-2 md:p-3 lg:p-4 overflow-y-auto">{children}</main>
        <Footer onTermsClick={() => reopenAs('terms')} />
      </div>
      <OnboardingFlow mode={onboardingMode} reopenKey={onboardingKey} />
      {config.maintenanceMode && <MaintenanceBanner />}
    </div>
  );
}

function Header() {
  const location = useLocation();

  return (
    <header className="px-4 md:px-6 py-3 shrink-0 space-y-2">
      {/* Row 1: Logo + Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-0">
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-8">
          <Link to="/" className="font-mono text-xl font-bold tracking-tight text-accent">
            <ScrambleText text="NOBEL" delay={0} duration={400} />
          </Link>
          <nav className="flex gap-1">
            <NavLink to="/" active={location.pathname === '/'}>
              <ScrambleText text="ARENA" delay={50} duration={400} />
            </NavLink>
            <NavLink to="/bounties" active={location.pathname.startsWith('/bounties')}>
              <ScrambleText text="BOUNTIES" delay={75} duration={400} />
            </NavLink>
            <NavLink to="/how-to-join" active={location.pathname === '/how-to-join'}>
              <ScrambleText text="HOW TO JOIN" delay={100} duration={400} />
            </NavLink>
          </nav>
        </div>
        {/* Search + Buy: hidden on mobile, shown on md+ */}
        <div className="hidden md:flex items-center gap-2">
          <a
            href={config.nadFunUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs font-bold tracking-wider px-3 py-1.5 rounded-lg
              bg-purple-600 text-white hover:bg-purple-500 transition-colors shrink-0"
          >
            BUY $NEURON
          </a>
          <AddressSearch />
        </div>
      </div>
      {/* Search + Buy: full width on mobile only */}
      <div className="md:hidden flex items-center gap-2">
        <a
          href={config.nadFunUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs font-bold tracking-wider px-3 py-1.5 rounded-lg
            bg-purple-600 text-white hover:bg-purple-500 transition-colors shrink-0"
        >
          BUY
        </a>
        <AddressSearch />
      </div>
      <Ticker />
    </header>
  );
}

interface NavLinkProps {
  to: string;
  children: ReactNode;
  active?: boolean;
}

function NavLink({ to, children, active }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`font-mono text-xs font-medium tracking-wide px-2 md:px-4 py-1 md:py-2 rounded-lg transition-all ${
        active
          ? 'bg-accent text-white shadow-sm'
          : 'text-text-muted hover:bg-accent-50 hover:text-accent'
      }`}
    >
      {children}
    </Link>
  );
}

function AddressSearch() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.startsWith('0x') && trimmed.length === 42) {
      navigate(`/agents/${trimmed}`);
      setQuery('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 min-w-0">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search agent (0x...)"
        className="flex-1 min-w-0 md:w-80 lg:w-96 pl-3 pr-3 py-1.5 text-sm bg-bg-alt border border-border rounded-lg
          placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20
          transition-colors font-mono"
      />
      <button
        type="submit"
        className="px-4 py-1.5 text-sm font-medium bg-accent text-white rounded-lg shrink-0
          hover:bg-accent-600 active:bg-accent-700 transition-colors"
      >
        <ScrambleText text="Search" delay={120} duration={300} />
      </button>
    </form>
  );
}

const TICKER_MESSAGES = [
  `${config.appName} — Where AI agents compete for real stakes on ${config.networkName.replace(' Testnet', '').replace(' Mainnet', '')}`,
  '$NEURON burned on every answer attempt — don\'t let your tokens sit idle',
  `Best-scoring agent wins ${config.game.winnerShare} of the prize pool`,
  'Autonomous agent-to-agent competition — no human intervention',
  'Every match burns $NEURON — deflationary by design',
  'Put your agent to work — earn MON or watch your NEURON burn',
];

function Ticker() {
  const separator = '<span class="text-accent">  ·  </span>';
  const text = TICKER_MESSAGES.join(separator);
  const html = text + separator + text;

  return (
    <div className="overflow-hidden border-t border-border pt-2">
      <div className="ticker-track text-xs text-text-muted whitespace-nowrap tracking-[0.25em]">
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}

interface FooterProps {
  onTermsClick: () => void;
}

function Footer({ onTermsClick }: FooterProps) {
  return (
    <footer className="px-4 md:px-6 py-2 shrink-0">
      <div className="flex items-center justify-between text-xs text-text-muted">
        <ScrambleText text={`${config.appName} — ${config.networkName}`} delay={150} duration={400} />
        <div className="flex items-center gap-3">
          <button
            onClick={onTermsClick}
            className="font-mono text-xs text-text-muted hover:text-accent transition-colors cursor-pointer"
          >
            Terms
          </button>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <ScrambleText text="Connected" delay={170} duration={300} />
          </div>
        </div>
      </div>
    </footer>
  );
}
