import { defineContentScript } from 'wxt/utils/define-content-script';
import {
  AUTO_PASTE_URL,
  EXPORT_BUTTON_ATTR,
  BATCH_EXPORT_BUTTON_ATTR,
  TABLE_MARKED_ATTR,
  BATCH_CONTAINER_ATTR,
} from '@/utils/constants';
import { parseHtmlTable, tableToTsv } from '@/utils/parse-table';
import { settingsItem } from '@/utils/storage';
import { BridgeMessage } from '@/utils/messages';
import { createExportButton, createGlobalBatchExportButton, ExportState } from './button';

export default defineContentScript({
  matches: [
    '*://*.chatgpt.com/*',
    '*://claude.ai/*',
    '*://*.deepseek.com/*',
    '*://gemini.google.com/*',
  ],
  runAt: 'document_idle',
  main() {
    let enabled = true;
    let observer: MutationObserver | null = null;
    let scanTimer: ReturnType<typeof setTimeout> | null = null;
    let globalBatchButton: HTMLButtonElement | null = null;

    const scheduleScan = (): void => {
      if (!enabled) return;
      if (scanTimer) return;
      scanTimer = setTimeout(() => {
        scanTimer = null;
        scanTables();
      }, 250);
    };

    const openDashboardTab = async (): Promise<void> => {
      const message: BridgeMessage = {
        type: 'tablexport-bridge/open-tab',
        url: AUTO_PASTE_URL,
      };
      try {
        await browser.runtime.sendMessage(message);
      } catch {
        window.open(AUTO_PASTE_URL, '_blank', 'noopener,noreferrer');
      }
    };

    const handleClick = async (
      table: HTMLTableElement,
      setState: (state: ExportState) => void,
    ): Promise<void> => {
      const parsed = parseHtmlTable(table);
      if (!parsed) {
        setState('error');
        return;
      }

      setState('working');
      const tsv = tableToTsv(parsed);

      try {
        await navigator.clipboard.writeText(tsv);
      } catch {
        setState('error');
        return;
      }

      await openDashboardTab();
      setState('success');
    };

    const handleGlobalBatchClick = async (
      setState: (state: ExportState) => void,
    ): Promise<void> => {
      setState('working');
      
      const allTables = document.querySelectorAll<HTMLTableElement>('table');
      const validTables = Array.from(allTables).filter(table => 
        table.isConnected && table.rows.length > 0
      );
      
      const tsvBlocks: string[] = [];
      for (const table of validTables) {
        const parsed = parseHtmlTable(table);
        if (parsed) {
          tsvBlocks.push(tableToTsv(parsed));
        }
      }

      if (tsvBlocks.length === 0) {
        setState('error');
        return;
      }

      // Concatenate TSV data separated by empty rows
      const combinedTsv = tsvBlocks.join('\n\n');

      try {
        await navigator.clipboard.writeText(combinedTsv);
      } catch {
        setState('error');
        return;
      }

      await openDashboardTab();
      setState('success');
    };

    const attachButton = (table: HTMLTableElement): void => {
      if (table.hasAttribute(TABLE_MARKED_ATTR)) return;
      if (!table.isConnected) return;
      if (table.rows.length === 0) return;

      table.setAttribute(TABLE_MARKED_ATTR, 'true');

      const button = createExportButton({
        onClick: (setState) => handleClick(table, setState),
      });

      // Create a wrapper for button + table to avoid breaking table layout
      const createButtonContainer = (): void => {
        // Create container div for button
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'tablexport-bridge-table-header';
        buttonContainer.style.cssText = `
          display: flex !important;
          justify-content: flex-start !important;
          margin-bottom: 8px !important;
          padding: 0 !important;
        `;
        buttonContainer.appendChild(button);

        // Insert button container before the table
        table.parentNode?.insertBefore(buttonContainer, table);
      };

      createButtonContainer();
    };

    const removeAllButtons = (): void => {
      document
        .querySelectorAll<HTMLElement>(`[${EXPORT_BUTTON_ATTR}]`)
        .forEach((node) => node.remove());
      document
        .querySelectorAll<HTMLElement>(`[${BATCH_EXPORT_BUTTON_ATTR}]`)
        .forEach((node) => node.remove());
      document
        .querySelectorAll<HTMLElement>(`[${TABLE_MARKED_ATTR}]`)
        .forEach((node) => node.removeAttribute(TABLE_MARKED_ATTR));
      document
        .querySelectorAll<HTMLElement>(`[${BATCH_CONTAINER_ATTR}]`)
        .forEach((node) => node.removeAttribute(BATCH_CONTAINER_ATTR));
      
      if (globalBatchButton) {
        globalBatchButton.remove();
        globalBatchButton = null;
      }
    };


    const updateGlobalBatchButton = (tableCount: number): void => {
      if (tableCount > 1) {
        if (!globalBatchButton) {
          globalBatchButton = createGlobalBatchExportButton({
            onClick: handleGlobalBatchClick,
            tableCount,
          });
          document.body.appendChild(globalBatchButton);
        }
        
        // Update table count in existing button
        const span = globalBatchButton.querySelector('span');
        if (span && globalBatchButton.dataset.state === 'idle') {
          span.textContent = `Export ${tableCount} tables`;
        }
        
        // Show button with animation
        globalBatchButton.classList.add('visible');
      } else {
        // Hide and remove button if 1 or fewer tables
        if (globalBatchButton) {
          globalBatchButton.classList.remove('visible');
          setTimeout(() => {
            if (globalBatchButton && !globalBatchButton.classList.contains('visible')) {
              globalBatchButton.remove();
              globalBatchButton = null;
            }
          }, 200);
        }
      }
    };

    const scanTables = (): void => {
      if (!enabled) return;
      const tables = document.querySelectorAll<HTMLTableElement>('table');
      const validTables = Array.from(tables).filter(table => 
        table.isConnected && table.rows.length > 0
      );
      
      // Attach individual buttons to all tables
      validTables.forEach(attachButton);
      
      // Update global batch button based on total table count
      updateGlobalBatchButton(validTables.length);
    };

    const startObserving = (): void => {
      if (observer) return;
      observer = new MutationObserver(() => scheduleScan());
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
      scheduleScan();
    };

    const stopObserving = (): void => {
      observer?.disconnect();
      observer = null;
      if (scanTimer) {
        clearTimeout(scanTimer);
        scanTimer = null;
      }
    };

    const applyEnabled = (nextEnabled: boolean): void => {
      enabled = nextEnabled;
      if (enabled) {
        startObserving();
      } else {
        stopObserving();
        removeAllButtons();
      }
    };

    void settingsItem.getValue().then((settings) => {
      applyEnabled(settings.injectButtons);
    });

    settingsItem.watch((next) => {
      applyEnabled(next?.injectButtons ?? true);
    });
  },
});
