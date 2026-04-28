import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

const EXTENSION_NAME = 'TableXport: AI Table Extractor';
const EXTENSION_DESCRIPTION =
  'Export tables from ChatGPT, Claude, Gemini, and DeepSeek to Excel or Google Sheets in one click.';
const EXTENSION_VERSION = '1.0.1';

const PERMISSIONS = ['storage', 'tabs', 'activeTab', 'clipboardWrite'] as const;

const HOST_PERMISSIONS = [
  '*://*.chatgpt.com/*',
  '*://claude.ai/*',
  '*://gemini.google.com/*',
  '*://*.deepseek.com/*',
] as const;

/** Toolbar + manifest sizes; 96 matches WXT/Chromium expectations (use 48px asset if no separate 96). */
const ICONS = {
  16: 'assets/icon-16.png',
  32: 'assets/icon-32.png',
  48: 'assets/icon-48.png',
  96: 'assets/icon-48.png',
  128: 'assets/icon-128.png',
} as const;

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: ({ browser }) => ({
    name: EXTENSION_NAME,
    description: EXTENSION_DESCRIPTION,
    version: EXTENSION_VERSION,
    permissions: [...PERMISSIONS],
    host_permissions: [...HOST_PERMISSIONS],
    icons: { ...ICONS },
    action: {
      default_title: 'TableXport',
      default_icon: {
        16: ICONS[16],
        32: ICONS[32],
      },
    },
    ...(browser === 'firefox'
      ? {
          browser_specific_settings: {
            gecko: {
              id: 'tablexport-ai-table-extractor@tablexport.com',
              strict_min_version: '109.0',
              data_collection_permissions: {
                required: ['none'],
              },
            },
          },
        }
      : {}),
  }),
  /** Narrow env types when branching on `import.meta.env.BROWSER`. */
  targetBrowsers: ['chrome', 'firefox', 'edge'],
});
