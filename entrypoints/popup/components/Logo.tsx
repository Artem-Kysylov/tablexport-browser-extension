const LOGO_ICON_PATH = '/assets/icon-32.png' as const;

interface LogoProps {
  readonly size?: number;
}

export const Logo = ({ size = 36 }: LogoProps) => (
  <div className="flex items-center gap-2.5">
    <img
      src={browser.runtime.getURL(LOGO_ICON_PATH)}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-[10px] object-cover shadow-[0_6px_14px_-4px_rgba(27,147,88,0.55)]"
      decoding="async"
      aria-hidden="true"
    />
    <div className="flex flex-col leading-tight">
      <span className="text-[15px] font-extrabold tracking-tight text-brand-dark">
        TableXport
      </span>
      <span className="text-[11px] font-medium text-brand-dark/60">
        AI Table Bridge
      </span>
    </div>
  </div>
);
