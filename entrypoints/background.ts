import { defineBackground } from 'wxt/utils/define-background';
import { isBridgeMessage } from '@/utils/messages';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!isBridgeMessage(message)) return false;

    void browser.tabs
      .create({ url: message.url, active: true })
      .then(() => sendResponse({ ok: true }))
      .catch((error: unknown) => {
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      });

    return true;
  });
});
