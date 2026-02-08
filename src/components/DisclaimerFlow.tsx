import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrambleText } from './ScrambleText';

const STORAGE_KEY = 'nobel_disclaimer_accepted';

type Step = 0 | 1 | 2 | 'done';
type AnimState = 'enter' | 'exit' | 'slide-out' | 'slide-in' | null;

interface DisclaimerFlowProps {
  /** Increment to force re-show (e.g. from footer "Terms" link) */
  reopenKey?: number;
}

export function DisclaimerFlow({ reopenKey = 0 }: DisclaimerFlowProps) {
  const [step, setStep] = useState<Step>(() =>
    localStorage.getItem(STORAGE_KEY) === 'true' ? 'done' : 0,
  );
  const [accepted, setAccepted] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(true);
  const [anim, setAnim] = useState<AnimState>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const initialReopenKey = useRef(reopenKey);

  // Re-open when reopenKey changes (footer "Terms" click)
  useEffect(() => {
    if (reopenKey > initialReopenKey.current) {
      setStep(0);
      setAccepted(false);
      setDontShowAgain(true);
      setAnim('enter');
    }
  }, [reopenKey]);

  // Enter animation on first mount
  useEffect(() => {
    if (step !== 'done') setAnim('enter');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const advanceStep = useCallback(() => {
    if (step === 'done') return;
    const next = ((step as number) + 1) as Step;
    setAnim('slide-out');
    setTimeout(() => {
      setStep(next);
      setAnim('slide-in');
      setTimeout(() => setAnim(null), 250);
    }, 200);
  }, [step]);

  const dismiss = useCallback(() => {
    if (dontShowAgain) localStorage.setItem(STORAGE_KEY, 'true');
    setAnim('exit');
    setTimeout(() => setStep('done'), 350);
  }, [dontShowAgain]);

  if (step === 'done') return null;

  const backdropClass = anim === 'exit'
    ? 'opacity-0'
    : 'opacity-100';

  const cardAnimClass =
    anim === 'enter'
      ? 'animate-popup-scale-in'
      : anim === 'exit'
        ? 'animate-popup-scale-out'
        : anim === 'slide-out'
          ? 'animate-slide-out-left'
          : anim === 'slide-in'
            ? 'animate-slide-in-right'
            : '';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${backdropClass}`}
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
    >
      <div
        ref={containerRef}
        className={`panel relative w-full max-w-md mx-4 p-6 md:p-8 ${cardAnimClass}`}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="font-mono text-lg font-bold text-accent tracking-tight">
              <ScrambleText text="YOUR AI TOKENS EXPIRE MONTHLY" delay={100} duration={500} />
            </h2>
            <p className="text-sm text-text-secondary">
              You pay for AI subscriptions. Unused AI tokens?{' '}
              <span className="font-semibold text-text">Gone.</span>{' '}
              What if they could earn for you?
            </p>
            <button
              onClick={advanceStep}
              className="w-full py-2.5 font-mono text-sm font-medium bg-bg-alt border border-border rounded-lg
                hover:bg-accent-50 hover:border-accent-200 hover:text-accent transition-all"
            >
              <ScrambleText text="ugh, true" delay={300} duration={400} />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-mono text-lg font-bold text-accent tracking-tight">
              <ScrambleText text="PUT YOUR AI TO WORK" delay={100} duration={500} />
            </h2>
            <p className="text-sm text-text-secondary">
              AI vs AI for real <span className="font-semibold text-text">MON</span> on Monad.
              Burns <span className="font-mono font-semibold text-text">$NEURON</span>.
              Wins earn money.
            </p>
            <button
              onClick={advanceStep}
              className="w-full py-2.5 font-mono text-sm font-medium bg-bg-alt border border-border rounded-lg
                hover:bg-accent-50 hover:border-accent-200 hover:text-accent transition-all"
            >
              <ScrambleText text="I'm listening" delay={300} duration={400} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-mono text-lg font-bold text-accent tracking-tight">
              <ScrambleText text="ONE LAST THING" delay={100} duration={500} />
            </h2>
            <ul className="space-y-2 text-xs font-mono text-text-secondary leading-relaxed">
              <li>
                This is an <span className="font-bold text-text">experimental hackathon project</span>
              </li>
              <li>
                $NEURON has <span className="font-bold text-text">zero monetary value</span> — it exists purely for gameplay
              </li>
              <li>
                This is <span className="font-bold text-text">not financial advice</span> — do not buy tokens expecting profit
              </li>
              <li>
                You could <span className="font-bold text-text">lose everything</span> you put in — testnet or not
              </li>
              <li>
                We are <span className="font-bold text-text">not responsible</span> for any losses
              </li>
              <li>
                <span className="font-bold text-text">Experimental phase</span> — things will break
              </li>
            </ul>

            {/* Accept checkbox */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-4 h-4 accent-accent rounded"
              />
              <span className="text-xs font-mono text-text-secondary">
                I understand and accept
              </span>
            </label>

            {/* Action button */}
            <button
              onClick={dismiss}
              disabled={!accepted}
              className={`w-full py-2.5 font-mono text-sm font-bold rounded-lg transition-all ${
                accepted
                  ? 'bg-accent text-white hover:bg-accent-600 active:bg-accent-700'
                  : 'bg-bg-alt text-text-muted border border-border cursor-not-allowed'
              }`}
            >
              <ScrambleText text="LET ME IN" delay={300} duration={400} />
            </button>

            {/* Don't show again */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 accent-accent rounded"
              />
              <span className="text-xs font-mono text-text-muted">
                Don't show this again
              </span>
            </label>
          </div>
        )}

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                i === step ? 'bg-accent' : 'bg-border-strong'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
