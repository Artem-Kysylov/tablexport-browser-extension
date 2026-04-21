import { useEffect, useState } from 'react';
import {
  BridgeSettings,
  settingsItem,
  updateSettings,
} from '@/utils/storage';

interface UseSettingsResult {
  readonly settings: BridgeSettings | null;
  readonly update: (patch: Partial<BridgeSettings>) => Promise<void>;
}

export const useSettings = (): UseSettingsResult => {
  const [settings, setSettings] = useState<BridgeSettings | null>(null);

  useEffect(() => {
    let isMounted = true;

    void settingsItem.getValue().then((value) => {
      if (isMounted) setSettings(value);
    });

    const unwatch = settingsItem.watch((next) => {
      if (isMounted && next) setSettings(next);
    });

    return () => {
      isMounted = false;
      unwatch();
    };
  }, []);

  const update = async (patch: Partial<BridgeSettings>): Promise<void> => {
    const next = await updateSettings(patch);
    setSettings(next);
  };

  return { settings, update };
};
