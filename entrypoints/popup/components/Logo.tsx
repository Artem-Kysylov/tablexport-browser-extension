interface LogoProps {
  readonly size?: number;
}

export const Logo = ({ size = 36 }: LogoProps) => (
  <div className="flex items-center gap-2.5">
    <div
      className="flex items-center justify-center rounded-[10px] bg-brand text-white shadow-[0_6px_14px_-4px_rgba(27,147,88,0.55)]"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.58}
        height={size * 0.58}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 5h7v5H3zM14 5h7v5h-7zM3 14h7v5H3zM14 14h7v5h-7z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
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
