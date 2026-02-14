import { ScrambleText } from './ScrambleText';

export function MaintenanceBanner() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="panel animate-popup-scale-in max-w-md w-full mx-4 p-8 text-center space-y-4">
        <svg
          className="mx-auto w-10 h-10 text-accent"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
        <h2 className="font-mono text-lg font-bold tracking-wider text-text">
          <ScrambleText text="UNDER MAINTENANCE" delay={100} duration={600} />
        </h2>
        <p className="text-sm text-text-muted leading-relaxed">
          We're performing scheduled maintenance. Please check back shortly.
        </p>
      </div>
    </div>
  );
}
