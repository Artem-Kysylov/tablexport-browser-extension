interface ToggleProps {
  readonly checked: boolean;
  readonly onChange: (next: boolean) => void;
  readonly label: string;
  readonly description?: string;
  readonly id: string;
}

export const Toggle = ({
  checked,
  onChange,
  label,
  description,
  id,
}: ToggleProps) => (
  <label
    htmlFor={id}
    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-brand-light bg-white px-4 py-3 transition-colors hover:border-brand/50"
  >
    <span className="flex flex-col">
      <span className="text-[13px] font-semibold text-brand-dark">
        {label}
      </span>
      {description ? (
        <span className="mt-0.5 text-[11px] leading-snug text-brand-dark/60">
          {description}
        </span>
      ) : null}
    </span>
    <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
      <span className="h-6 w-11 rounded-full bg-brand-dark/15 transition-colors peer-checked:bg-brand" />
      <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
    </span>
  </label>
);
