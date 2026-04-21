import { BRAND, EXPORT_BUTTON_ATTR, BATCH_EXPORT_BUTTON_ATTR } from '@/utils/constants';

export type ExportState = 'idle' | 'working' | 'success' | 'error';

interface CreateExportButtonOptions {
  onClick: (setState: (state: ExportState) => void) => Promise<void> | void;
}

interface CreateBatchExportButtonOptions {
  onClick: (setState: (state: ExportState) => void) => Promise<void> | void;
}

interface CreateGlobalBatchExportButtonOptions {
  onClick: (setState: (state: ExportState) => void) => Promise<void> | void;
  tableCount: number;
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
  idle: { icon: ICON_BATCH_EXPORT, label: 'Export All Tables', tooltip: 'Export all tables on this page' },
  working: { icon: ICON_SPINNER, label: 'Copying tables…', tooltip: 'Copying all tables…' },
  success: { icon: ICON_CHECK, label: 'All copied! Opening TableXport…', tooltip: 'All tables copied! Opening TableXport…' },
  error: { icon: ICON_ERROR, label: 'Export failed — try again', tooltip: 'Export failed — try again' },
};

const ensureStylesheet = (): void => {
  const id = 'tablexport-bridge-styles';
  if (document.getElementById(id)) return;

  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    /* CSS Reset for TableXport Bridge components */
    .tablexport-bridge-btn,
    .tablexport-bridge-global-batch-btn,
    .tablexport-bridge-tooltip,
    .tablexport-bridge-table-wrapper {
      /* Reset all inherited styles */
      animation: none !important;
      animation-delay: 0s !important;
      animation-direction: normal !important;
      animation-duration: 0s !important;
      animation-fill-mode: none !important;
      animation-iteration-count: 1 !important;
      animation-name: none !important;
      animation-play-state: running !important;
      animation-timing-function: ease !important;
      backface-visibility: visible !important;
      background: transparent !important;
      background-attachment: scroll !important;
      background-clip: border-box !important;
      background-image: none !important;
      background-origin: padding-box !important;
      background-position: 0% 0% !important;
      background-repeat: repeat !important;
      background-size: auto auto !important;
      border-collapse: separate !important;
      border-spacing: 0 !important;
      bottom: auto !important;
      caption-side: top !important;
      clear: none !important;
      clip: auto !important;
      content: normal !important;
      counter-increment: none !important;
      counter-reset: none !important;
      direction: ltr !important;
      empty-cells: show !important;
      float: none !important;
      font-style: normal !important;
      font-variant: normal !important;
      left: auto !important;
      list-style: none !important;
      list-style-image: none !important;
      list-style-position: outside !important;
      list-style-type: disc !important;
      max-height: none !important;
      max-width: none !important;
      min-height: 0 !important;
      min-width: 0 !important;
      orphans: 2 !important;
      overflow: visible !important;
      overflow-x: visible !important;
      overflow-y: visible !important;
      page-break-after: auto !important;
      page-break-before: auto !important;
      page-break-inside: auto !important;
      perspective: none !important;
      perspective-origin: 50% 50% !important;
      right: auto !important;
      tab-size: 8 !important;
      table-layout: auto !important;
      text-decoration: none !important;
      text-indent: 0 !important;
      text-shadow: none !important;
      text-transform: none !important;
      top: auto !important;
      transform: none !important;
      transform-origin: 50% 50% 0 !important;
      transform-style: flat !important;
      unicode-bidi: normal !important;
      vertical-align: baseline !important;
      visibility: visible !important;
      white-space: normal !important;
      widows: 2 !important;
      word-spacing: normal !important;
    }

    @keyframes tablexport-bridge-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .tablexport-bridge-btn {
      /* Reset potential platform conflicts */
      all: revert;
      appearance: none !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      box-sizing: border-box !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 45px !important;
      height: 45px !important;
      min-width: 45px !important;
      min-height: 45px !important;
      max-width: 45px !important;
      max-height: 45px !important;
      border-radius: 50% !important;
      background-color: ${BRAND.primary} !important;
      color: ${BRAND.white} !important;
      cursor: pointer !important;
      box-shadow: 0 4px 12px rgba(27, 147, 88, 0.3) !important;
      transition: all 200ms ease !important;
      border: none !important;
      user-select: none !important;
      position: absolute !important;
      top: 8px !important;
      left: 8px !important;
      z-index: 999999 !important;
      margin: 0 !important;
      padding: 0 !important;
      font-family: inherit !important;
      font-size: 16px !important;
      line-height: 1 !important;
      text-align: center !important;
      vertical-align: baseline !important;
      outline: none !important;
    }
    .tablexport-bridge-btn:hover {
      transform: scale(1.05) !important;
      box-shadow: 0 6px 20px rgba(27, 147, 88, 0.4) !important;
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
      width: 20px !important;
      height: 20px !important;
      stroke: currentColor !important;
      fill: none !important;
    }
    .tablexport-bridge-table-container {
      position: relative;
    }
    .tablexport-bridge-table-wrapper {
      position: relative !important;
      display: inline-block !important;
    }
    .tablexport-bridge-tooltip {
      position: absolute !important;
      background-color: #000000 !important;
      color: #ffffff !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif !important;
      line-height: 1.3 !important;
      padding: 6px 10px !important;
      border-radius: 6px !important;
      white-space: nowrap !important;
      opacity: 0 !important;
      visibility: hidden !important;
      transform: translateY(-5px) !important;
      transition: opacity 200ms ease, visibility 200ms ease, transform 200ms ease !important;
      z-index: 999999 !important;
      pointer-events: none !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
      margin: 0 !important;
      border: none !important;
      text-align: center !important;
      letter-spacing: 0.01em !important;
    }
    .tablexport-bridge-tooltip.visible {
      opacity: 1 !important;
      visibility: visible !important;
      transform: translateY(0) !important;
    }
    .tablexport-bridge-tooltip::before {
      content: '' !important;
      position: absolute !important;
      top: 100% !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      width: 0 !important;
      height: 0 !important;
      border-left: 6px solid transparent !important;
      border-right: 6px solid transparent !important;
      border-top: 6px solid #000000 !important;
    }
    .tablexport-bridge-global-batch-btn {
      /* Reset potential platform conflicts */
      all: revert;
      appearance: none !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      position: fixed !important;
      bottom: 24px !important;
      right: 24px !important;
      z-index: 999999 !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      padding: 12px 16px !important;
      background-color: ${BRAND.primary} !important;
      color: ${BRAND.white} !important;
      border: none !important;
      border-radius: 24px !important;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      line-height: 1.2 !important;
      letter-spacing: 0.01em !important;
      cursor: pointer !important;
      box-shadow: 0 8px 24px rgba(27, 147, 88, 0.3), 0 4px 12px rgba(0, 0, 0, 0.15) !important;
      transition: all 200ms ease !important;
      user-select: none !important;
      white-space: nowrap !important;
      margin: 0 !important;
      text-align: center !important;
      vertical-align: baseline !important;
      outline: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      transform: translateY(10px) !important;
    }
    .tablexport-bridge-global-batch-btn.visible {
      opacity: 1 !important;
      visibility: visible !important;
      transform: translateY(0) !important;
    }
    .tablexport-bridge-global-batch-btn:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 12px 32px rgba(27, 147, 88, 0.4), 0 6px 16px rgba(0, 0, 0, 0.2) !important;
    }
    .tablexport-bridge-global-batch-btn:focus-visible {
      outline: 2px solid ${BRAND.primary} !important;
      outline-offset: 2px !important;
    }
    .tablexport-bridge-global-batch-btn[data-state="success"] {
      background-color: ${BRAND.primaryLight} !important;
      color: ${BRAND.secondary} !important;
    }
    .tablexport-bridge-global-batch-btn[data-state="error"] {
      background-color: #b42318 !important;
      color: ${BRAND.white} !important;
    }
    .tablexport-bridge-global-batch-btn[data-state="working"] {
      cursor: progress !important;
      opacity: 0.9 !important;
    }
    .tablexport-bridge-global-batch-btn svg {
      width: 16px !important;
      height: 16px !important;
      stroke: currentColor !important;
      fill: none !important;
    }
  `;
  document.head.appendChild(style);
};

const createTooltip = (text: string): HTMLDivElement => {
  const tooltip = document.createElement('div');
  tooltip.className = 'tablexport-bridge-tooltip';
  tooltip.textContent = text;
  return tooltip;
};

const positionTooltip = (button: HTMLButtonElement, tooltip: HTMLDivElement): void => {
  const buttonRect = button.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  
  // Position above the button, centered
  tooltip.style.bottom = '100%';
  tooltip.style.left = '50%';
  tooltip.style.transform = 'translateX(-50%) translateY(-8px)';
  tooltip.style.marginBottom = '8px';
};

const renderState = (button: HTMLButtonElement, state: ExportState, isBatch = false): void => {
  const stateCopy = isBatch ? BATCH_STATE_COPY : STATE_COPY;
  const { icon, label, tooltip } = stateCopy[state];
  button.dataset.state = state;
  button.setAttribute('aria-label', label);
  button.disabled = state === 'working';
  
  if (isBatch) {
    // For batch buttons, include both icon and text
    button.innerHTML = `${icon}<span>${label}</span>`;
    // Add tooltip after setting innerHTML
    const tooltipElement = createTooltip(tooltip);
    button.appendChild(tooltipElement);
  } else {
    // For single export buttons, only show icon
    button.innerHTML = icon;
    // Add tooltip
    const tooltipElement = createTooltip(tooltip);
    button.appendChild(tooltipElement);
  }
};

const setupTooltipEvents = (button: HTMLButtonElement): void => {
  let hideTimeout: ReturnType<typeof setTimeout> | null = null;
  
  button.addEventListener('mouseenter', () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    
    const tooltip = button.querySelector('.tablexport-bridge-tooltip');
    if (tooltip) {
      tooltip.classList.add('visible');
    }
  });

  button.addEventListener('mouseleave', () => {
    const tooltip = button.querySelector('.tablexport-bridge-tooltip');
    if (tooltip) {
      hideTimeout = setTimeout(() => {
        tooltip.classList.remove('visible');
      }, 100);
    }
  });
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
  setupTooltipEvents(button);

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

export const createGlobalBatchExportButton = ({
  onClick,
  tableCount,
}: CreateGlobalBatchExportButtonOptions): HTMLButtonElement => {
  ensureStylesheet();

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tablexport-bridge-global-batch-btn';
  button.setAttribute(BATCH_EXPORT_BUTTON_ATTR, 'true');
  
  // Custom render for global button with table count
  const renderGlobalState = (state: ExportState): void => {
    const stateCopy = BATCH_STATE_COPY[state];
    const { icon, label } = stateCopy;
    button.dataset.state = state;
    button.setAttribute('aria-label', `${label} (${tableCount} tables)`);
    button.disabled = state === 'working';
    
    const countText = state === 'idle' ? `${tableCount} tables` : label;
    button.innerHTML = `${icon}<span>Export ${countText}</span>`;
  };

  renderGlobalState('idle');

  const setState = (state: ExportState): void => {
    renderGlobalState(state);
    if (state === 'success' || state === 'error') {
      window.setTimeout(() => renderGlobalState('idle'), 2200);
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
