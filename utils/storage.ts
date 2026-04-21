import { storage } from 'wxt/utils/storage';

export interface BridgeSettings {
  injectButtons: boolean;
}

const SETTINGS_KEY = 'local:tablexport-bridge-settings' as const;

const DEFAULT_SETTINGS: BridgeSettings = {
  injectButtons: true,
};

export const settingsItem = storage.defineItem<BridgeSettings>(SETTINGS_KEY, {
  fallback: DEFAULT_SETTINGS,
  version: 1,
});

export const getSettings = (): Promise<BridgeSettings> =>
  settingsItem.getValue();

export const setSettings = (next: BridgeSettings): Promise<void> =>
  settingsItem.setValue(next);

export const updateSettings = async (
  patch: Partial<BridgeSettings>,
): Promise<BridgeSettings> => {
  const current = await settingsItem.getValue();
  const next: BridgeSettings = { ...current, ...patch };
  await settingsItem.setValue(next);
  return next;
};
