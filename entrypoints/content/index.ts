import { defineContentScript } from 'wxt/utils/define-content-script';
import {
  AUTO_PASTE_URL,
  EXPORT_BUTTON_ATTR,
  TABLE_MARKED_ATTR,
} from '@/utils/constants';
import { parseHtmlTable, tableToTsv } from '@/utils/parse-table';
import { settingsItem } from '@/utils/storage';
import { BridgeMessage } from '@/utils/messages';
import { createExportButton, ExportState } from './button';

export default defineContentScript({
  matches: ['*://*.chatgpt.com/*', '*://claude.ai/*'],
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

    const attachButton = (table: HTMLTableElement): void => {
      if (table.hasAttribute(TABLE_MARKED_ATTR)) return;
      if (!table.isConnected) return;
      if (table.rows.length === 0) return;

      table.setAttribute(TABLE_MARKED_ATTR, 'true');

      const button = createExportButton({
        onClick: (setState) => handleClick(table, setState),
      });

      table.insertAdjacentElement('beforebegin', button);
    };

    const removeAllButtons = (): void => {
      document
        .querySelectorAll<HTMLElement>(`[${EXPORT_BUTTON_ATTR}]`)
        .forEach((node) => node.remove());
      document
        .querySelectorAll<HTMLElement>(`[${TABLE_MARKED_ATTR}]`)
        .forEach((node) => node.removeAttribute(TABLE_MARKED_ATTR));
    };

    const scanTables = (): void => {
      if (!enabled) return;
      const tables = document.querySelectorAll<HTMLTableElement>('table');
      tables.forEach(attachButton);
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
