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
import { createExportButton, createBatchExportButton, ExportState } from './button';

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

    const handleBatchClick = async (
      tables: HTMLTableElement[],
      setState: (state: ExportState) => void,
    ): Promise<void> => {
      setState('working');
      
      const tsvBlocks: string[] = [];
      for (const table of tables) {
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

      // Try to position elegantly relative to the table
      const tableParent = table.parentElement;
      if (tableParent) {
        // Check if parent already has relative positioning
        const parentComputedStyle = window.getComputedStyle(tableParent);
        const hasRelativeParent = parentComputedStyle.position === 'relative' || 
                                  parentComputedStyle.position === 'absolute';

        if (!hasRelativeParent && tableParent.tagName !== 'BODY' && tableParent.tagName !== 'HTML') {
          // Wrap table in a positioned container
          const wrapper = document.createElement('div');
          wrapper.className = 'tablexport-bridge-table-wrapper';
          tableParent.insertBefore(wrapper, table);
          wrapper.appendChild(table);
          
          button.className += ' tablexport-bridge-btn-positioned';
          wrapper.appendChild(button);
        } else {
          // Insert button right before table with some margin
          button.style.marginBottom = '8px';
          button.style.marginLeft = 'auto';
          button.style.display = 'block';
          button.style.width = 'fit-content';
          table.insertAdjacentElement('beforebegin', button);
        }
      } else {
        // Fallback: insert before table
        table.insertAdjacentElement('beforebegin', button);
      }
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
    };

    const findMessageContainer = (table: HTMLTableElement): HTMLElement | null => {
      // Try to find a message container that could contain multiple tables
      // Look for common AI chat message patterns
      let current = table.parentElement;
      let depth = 0;
      const maxDepth = 10;

      while (current && depth < maxDepth) {
        const tagName = current.tagName.toLowerCase();
        const classNames = current.className.toLowerCase();
        
        // Common patterns for AI chat messages
        if (
          classNames.includes('message') ||
          classNames.includes('response') ||
          classNames.includes('assistant') ||
          classNames.includes('ai') ||
          classNames.includes('chat') ||
          tagName === 'article' ||
          (current.getAttribute('role') === 'article') ||
          (current.querySelector && current.querySelectorAll('table').length > 1)
        ) {
          return current;
        }
        
        current = current.parentElement;
        depth++;
      }
      
      return null;
    };

    const attachBatchButton = (container: HTMLElement, tables: HTMLTableElement[]): void => {
      if (container.hasAttribute(BATCH_CONTAINER_ATTR)) return;
      container.setAttribute(BATCH_CONTAINER_ATTR, 'true');

      const batchButton = createBatchExportButton({
        onClick: (setState) => handleBatchClick(tables, setState),
      });

      // Position the batch button at the top-right of the container or before the first table
      const firstTable = tables[0];
      if (firstTable) {
        batchButton.style.float = 'right';
        batchButton.style.marginBottom = '8px';
        firstTable.insertAdjacentElement('beforebegin', batchButton);
      }
    };

    const scanTables = (): void => {
      if (!enabled) return;
      const tables = document.querySelectorAll<HTMLTableElement>('table');
      
      // First, attach individual buttons to all tables
      tables.forEach(attachButton);
      
      // Then, check for containers with multiple tables for batch export
      const processedContainers = new Set<HTMLElement>();
      
      tables.forEach((table) => {
        const container = findMessageContainer(table);
        if (!container || processedContainers.has(container)) return;
        
        // Find all tables within this container
        const containerTables = Array.from(container.querySelectorAll<HTMLTableElement>('table'))
          .filter(t => t.isConnected && t.rows.length > 0);
        
        // Only add batch export if there are 2 or more tables
        if (containerTables.length > 1) {
          attachBatchButton(container, containerTables);
          processedContainers.add(container);
        }
      });
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
