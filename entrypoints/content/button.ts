import { BRAND, EXPORT_BUTTON_ATTR, BATCH_EXPORT_BUTTON_ATTR } from '@/utils/constants';

export type ExportState = 'idle' | 'working' | 'success' | 'error';

interface CreateExportButtonOptions {
  onClick: (setState: (state: ExportState) => void) => Promise<void> | void;
}

interface CreateBatchExportButtonOptions {
  onClick: (setState: (state: ExportState) => void) => Promise<void> | void;
}

const ICON_EXPORT = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 3v12" />
    <path d="m7 10 5-5 5 5" />
    <path d="M5 21h14" />
  </svg>
`;

const ICON_BATCH_EXPORT = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 3v12" />
    <path d="m7 10 5-5 5 5" />
    <path d="M5 21h14" />
    <path d="M14 3h4" />
    <path d="M18 3v4" />
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

const STATE_COPY: Record<ExportState, { icon: string; label: string; tooltip: string }> = {
  idle: { icon: ICON_EXPORT, label: 'Export to TableXport', tooltip: 'Export to TableXport' },
  working: { icon: ICON_SPINNER, label: 'Copying table…', tooltip: 'Copying table…' },
  success: { icon: ICON_CHECK, label: 'Copied! Opening TableXport…', tooltip: 'Copied! Opening TableXport…' },
  error: { icon: ICON_ERROR, label: 'Export failed — try again', tooltip: 'Export failed — try again' },
};

const BATCH_STATE_COPY: Record<ExportState, { icon: string; label: string; tooltip: string }> = {
  idle: { icon: ICON_BATCH_EXPORT, label: 'Batch Export All Tables', tooltip: 'Export all tables in this response' },
  working: { icon: ICON_SPINNER, label: 'Copying tables…', tooltip: 'Copying all tables…' },
  success: { icon: ICON_CHECK, label: 'All copied! Opening TableXport…', tooltip: 'All tables copied! Opening TableXport…' },
  error: { icon: ICON_ERROR, label: 'Batch export failed — try again', tooltip: 'Batch export failed — try again' },
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
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: ${BRAND.primary};
      color: ${BRAND.white};
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(6, 32, 19, 0.15), 0 2px 8px rgba(27, 147, 88, 0.2);
      transition: all 160ms ease;
      border: 1px solid transparent;
      user-select: none;
      position: relative;
      z-index: 10000;
    }
    .tablexport-bridge-btn:hover {
      background-color: ${BRAND.white};
      color: ${BRAND.primary};
      border-color: ${BRAND.primary};
      transform: scale(1.05);
      box-shadow: 0 3px 6px rgba(6, 32, 19, 0.2), 0 4px 12px rgba(27, 147, 88, 0.3);
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
    .tablexport-bridge-btn svg {
      width: 16px;
      height: 16px;
    }
    .tablexport-bridge-table-container {
      position: relative;
    }
    .tablexport-bridge-table-wrapper {
      position: relative;
      display: inline-block;
    }
    .tablexport-bridge-btn-positioned {
      position: absolute;
      top: -8px;
      right: -8px;
      z-index: 10000;
    }
    .tablexport-bridge-batch-btn {
      all: unset;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin: 8px 8px 8px 0;
      padding: 6px 12px;
      border-radius: 6px;
      background-color: ${BRAND.primary};
      color: ${BRAND.white};
      font: 500 12px/1.2 -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
      letter-spacing: 0.01em;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(6, 32, 19, 0.12), 0 3px 8px rgba(27, 147, 88, 0.2);
      transition: all 160ms ease;
      border: 1px solid transparent;
      user-select: none;
      position: relative;
      z-index: 10000;
    }
    .tablexport-bridge-batch-btn:hover {
      background-color: ${BRAND.white};
      color: ${BRAND.primary};
      border-color: ${BRAND.primary};
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(6, 32, 19, 0.15), 0 4px 12px rgba(27, 147, 88, 0.25);
    }
    .tablexport-bridge-batch-btn:focus-visible {
      outline: 2px solid ${BRAND.primary};
      outline-offset: 2px;
    }
    .tablexport-bridge-batch-btn[data-state="success"] {
      background-color: ${BRAND.primaryLight};
      color: ${BRAND.secondary};
      border-color: ${BRAND.primary};
    }
    .tablexport-bridge-batch-btn[data-state="error"] {
      background-color: ${BRAND.white};
      color: #b42318;
      border-color: #b42318;
    }
    .tablexport-bridge-batch-btn[data-state="working"] {
      cursor: progress;
      opacity: 0.9;
    }
    .tablexport-bridge-batch-btn svg {
      width: 14px;
      height: 14px;
    }
  `;
  document.head.appendChild(style);
};

const renderState = (button: HTMLButtonElement, state: ExportState, isBatch = false): void => {
  const stateCopy = isBatch ? BATCH_STATE_COPY : STATE_COPY;
  const { icon, label, tooltip } = stateCopy[state];
  button.dataset.state = state;
  button.setAttribute('aria-label', label);
  button.setAttribute('title', tooltip);
  button.disabled = state === 'working';
  
  if (isBatch) {
    button.innerHTML = `${icon}<span>${label}</span>`;
  } else {
    button.innerHTML = icon;
  }
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

export const createBatchExportButton = ({
  onClick,
}: CreateBatchExportButtonOptions): HTMLButtonElement => {
  ensureStylesheet();

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tablexport-bridge-batch-btn';
  button.setAttribute(BATCH_EXPORT_BUTTON_ATTR, 'true');
  renderState(button, 'idle', true);

  const setState = (state: ExportState): void => {
    renderState(button, state, true);
    if (state === 'success' || state === 'error') {
      window.setTimeout(() => renderState(button, 'idle', true), 2200);
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
