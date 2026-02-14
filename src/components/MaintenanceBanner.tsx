import { ScrambleText } from './ScrambleText';

export function MaintenanceBanner() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="animate-popup-scale-in max-w-sm w-full mx-4 text-center space-y-6">
        {/* Animated icon with glow */}
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full border border-accent/30 bg-accent/10">
            <svg
              className="w-7 h-7 text-accent"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-mono text-xl font-bold tracking-[0.25em] text-white">
            <ScrambleText text="UNDER MAINTENANCE" delay={100} duration={600} />
          </h2>
          <div className="mx-auto w-12 h-px bg-accent/40" />
          <p className="text-sm text-neutral-400 leading-relaxed">
            We're performing scheduled maintenance.<br />
            Please check back shortly.
          </p>
        </div>

        {/* Subtle branding */}
        <p className="font-mono text-[10px] tracking-[0.3em] text-neutral-600 uppercase">
          Nobel Arena
        </p>
      </div>
    </div>
  );
}
