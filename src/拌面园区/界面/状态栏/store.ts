import { defineMvuDataStore } from '@util/mvu';
import { Schema } from '../../schema';
export function useDataStore() {
  return defineMvuDataStore(Schema, { type: 'message', message_id: getCurrentMessageId() })();
}
export function resolvePreviewData(): Schema {
  const raw = location.hash.slice(1);
  if (!raw) return Schema.parse({});
  const value = JSON.parse(decodeURIComponent(raw));
  return Schema.parse(value.stat_data ?? value);
}
