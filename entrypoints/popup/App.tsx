import { DASHBOARD_URL } from '@/utils/constants';
import { Logo } from './components/Logo';
import { SocialLinks } from './components/SocialLinks';
import { Toggle } from './components/Toggle';
import { useSettings } from './hooks/useSettings';

const ExternalArrow = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </svg>
);

const openDashboard = (): void => {
  void browser.tabs.create({ url: DASHBOARD_URL, active: true });
};

const App = () => {
  const { settings, update } = useSettings();

  const injectEnabled = settings?.injectButtons ?? true;
  const isReady = settings !== null;

  return (
    <div className="flex min-h-[400px] w-[360px] flex-col bg-gradient-to-b from-white via-white to-brand-light/40">
      <header className="flex items-center justify-between px-5 pt-5">
        <Logo />
        <span className="rounded-full border border-brand-light bg-brand-light/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-dark/80">
          Bridge
        </span>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-5 pt-4">
        <section className="rounded-2xl border border-brand-light bg-white p-4 shadow-[0_10px_30px_-20px_rgba(6,32,19,0.45)]">
          <h1 className="text-[15px] font-bold leading-snug text-brand-dark">
            One-click table export
          </h1>
          <p className="mt-1 text-[12px] leading-relaxed text-brand-dark/70">
            Send tables from ChatGPT and Claude straight into your TableXport
            workspace.
          </p>
          <button
            type="button"
            onClick={openDashboard}
            className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[8px] bg-brand px-4 py-3 text-[13px] font-bold text-white shadow-none transition-all duration-200 ease-out hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(27,147,88,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Go to Dashboard
            {ExternalArrow}
          </button>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wider text-brand-dark/50">
            Settings
          </h2>
          <Toggle
            id="inject-buttons-toggle"
            checked={injectEnabled}
            onChange={(next) => {
              void update({ injectButtons: next });
            }}
            label="Enable Export buttons in chat"
            description="Inject an Export button next to tables in supported AI chats."
          />
          {!isReady ? (
            <p className="px-1 text-[10px] text-brand-dark/40">Loading…</p>
          ) : null}
        </section>
      </main>

      <footer className="mt-auto border-t border-brand-light/80 px-5 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[11px] text-brand-dark/60">
              v1.0.0 · Made with care
            </span>
            <a
              href="mailto:hello@tablexport.com"
              className="w-fit max-w-full truncate text-[11px] font-medium text-brand-dark/55 underline decoration-brand-dark/25 underline-offset-2 transition-colors hover:text-brand hover:decoration-brand/50"
            >
              hello@tablexport.com
            </a>
          </div>
          <SocialLinks />
        </div>
      </footer>
    </div>
  );
};

export default App;
