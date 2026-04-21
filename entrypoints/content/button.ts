import { BRAND, EXPORT_BUTTON_ATTR } from '@/utils/constants';

export type ExportState = 'idle' | 'working' | 'success' | 'error';

interface CreateExportButtonOptions {
  onClick: (setState: (state: ExportState) => void) => Promise<void> | void;
}

const ICON_EXPORT = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 3v12" />
    <path d="m7 10 5-5 5 5" />
    <path d="M5 21h14" />
  </svg>
`;

const ICON_SPINNER = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="animation: tablexport-bridge-spin 0.9s linear infinite;" aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
`;

const ICON_CHECK = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m5 12 5 5L20 7" />
  </svg>
`;

const ICON_ERROR = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
`;

const STATE_COPY: Record<ExportState, { icon: string; label: string }> = {
  idle: { icon: ICON_EXPORT, label: 'Export to TableXport' },
  working: { icon: ICON_SPINNER, label: 'Copying table…' },
  success: { icon: ICON_CHECK, label: 'Copied! Opening TableXport…' },
  error: { icon: ICON_ERROR, label: 'Export failed — try again' },
};

const ensureStylesheet = (): void => {
  const id = 'tablexport-bridge-styles';
  if (document.getElementById(id)) return;

  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    @keyframes tablexport-bridge-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .tablexport-bridge-btn {
      all: unset;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
      padding: 8px 14px;
      border-radius: 8px;
      background-color: ${BRAND.primary};
      color: ${BRAND.white};
      font: 600 13px/1 -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
      letter-spacing: 0.01em;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(6, 32, 19, 0.12), 0 4px 10px rgba(27, 147, 88, 0.25);
      transition: background-color 160ms ease, transform 160ms ease, box-shadow 160ms ease, color 160ms ease, border-color 160ms ease;
      border: 1px solid transparent;
      user-select: none;
    }
    .tablexport-bridge-btn:hover {
      background-color: ${BRAND.white};
      color: ${BRAND.primary};
      border-color: ${BRAND.primary};
    }
    .tablexport-bridge-btn:focus-visible {
      outline: 2px solid ${BRAND.primary};
      outline-offset: 2px;
    }
    .tablexport-bridge-btn[data-state="success"] {
      background-color: ${BRAND.primaryLight};
      color: ${BRAND.secondary};
      border-color: ${BRAND.primary};
    }
    .tablexport-bridge-btn[data-state="error"] {
      background-color: ${BRAND.white};
      color: #b42318;
      border-color: #b42318;
    }
    .tablexport-bridge-btn[data-state="working"] {
      cursor: progress;
      opacity: 0.9;
    }
  `;
  document.head.appendChild(style);
};

const renderState = (button: HTMLButtonElement, state: ExportState): void => {
  const { icon, label } = STATE_COPY[state];
  button.dataset.state = state;
  button.setAttribute('aria-label', label);
  button.disabled = state === 'working';
  button.innerHTML = `${icon}<span>${label}</span>`;
};

export const createExportButton = ({
  onClick,
}: CreateExportButtonOptions): HTMLButtonElement => {
  ensureStylesheet();

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tablexport-bridge-btn';
  button.setAttribute(EXPORT_BUTTON_ATTR, 'true');
  renderState(button, 'idle');

  const setState = (state: ExportState): void => {
    renderState(button, state);
    if (state === 'success' || state === 'error') {
      window.setTimeout(() => renderState(button, 'idle'), 2200);
    }
  };

  button.addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (button.disabled) return;
    try {
      await onClick(setState);
    } catch {
      setState('error');
    }
  });

  return button;
};
