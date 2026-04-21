export interface OpenTabMessage {
  type: 'tablexport-bridge/open-tab';
  url: string;
}

export type BridgeMessage = OpenTabMessage;

export const isBridgeMessage = (value: unknown): value is BridgeMessage => {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<BridgeMessage>;
  return candidate.type === 'tablexport-bridge/open-tab';
};
