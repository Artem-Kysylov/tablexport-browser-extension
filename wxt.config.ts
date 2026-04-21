import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'TableXport — AI Table Bridge',
    description:
      'Export tables from ChatGPT and Claude straight into TableXport with a single click.',
    version: '0.1.0',
    permissions: ['activeTab', 'clipboardWrite', 'storage', 'tabs'],
    host_permissions: [
      '*://*.chatgpt.com/*',
      '*://claude.ai/*',
      '*://*.deepseek.com/*',
      '*://gemini.google.com/*',
    ],
    action: {
      default_title: 'TableXport',
    },
  },
});
