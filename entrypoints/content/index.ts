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

      // Insert button directly into the table - much more reliable approach
      const insertButtonIntoTable = (): void => {
        // Try to find the first row (header or data)
        const firstRow = table.querySelector('tr');
        if (!firstRow) return;

        // Create a cell to contain the button if we're in thead, or modify first cell if tbody
        const headerSection = table.querySelector('thead');
        const isInHeader = headerSection && headerSection.contains(firstRow);
        
        if (isInHeader) {
          // Insert button in a new header cell at the beginning
          const buttonCell = document.createElement('th');
          buttonCell.className = 'tablexport-bridge-button-cell';
          buttonCell.style.cssText = `
            padding: 4px !important;
            border: none !important;
            background: transparent !important;
            width: 1% !important;
            vertical-align: top !important;
          `;
          buttonCell.appendChild(button);
          firstRow.insertBefore(buttonCell, firstRow.firstChild);
        } else {
          // Insert in the first data cell
          const firstCell = firstRow.querySelector('td, th');
          if (firstCell) {
            // Create a wrapper div inside the first cell
            const buttonWrapper = document.createElement('div');
            buttonWrapper.className = 'tablexport-bridge-button-wrapper';
            buttonWrapper.style.cssText = `
              display: flex !important;
              align-items: flex-start !important;
              gap: 8px !important;
              margin-bottom: 4px !important;
            `;
            
            // Move existing content to a content wrapper
            const contentWrapper = document.createElement('div');
            contentWrapper.style.cssText = 'flex: 1 !important;';
            while (firstCell.firstChild) {
              contentWrapper.appendChild(firstCell.firstChild);
            }
            
            // Add button and content back to cell
            buttonWrapper.appendChild(button);
            buttonWrapper.appendChild(contentWrapper);
            firstCell.appendChild(buttonWrapper);
          }
        }
      };

      insertButtonIntoTable();
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
