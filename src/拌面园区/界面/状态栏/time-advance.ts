import type { Schema } from '../../schema';
import { pickAdvanceEvent, type AdvanceHistory } from './time-advance-events';

const HISTORY_KEY = 'banmian_advance_history';

function readHistory(): AdvanceHistory {
  const vars = getVariables({ type: 'chat' }) as Record<string, unknown> | undefined;
  const raw = vars?.[HISTORY_KEY] as Partial<AdvanceHistory> | undefined;
  return {
    exclusiveTriggered:
      raw?.exclusiveTriggered && typeof raw.exclusiveTriggered === 'object'
        ? { ...(raw.exclusiveTriggered as Record<string, boolean>) }
        : {},
    recentCommonIds: Array.isArray(raw?.recentCommonIds)
      ? raw.recentCommonIds.filter((id): id is string => typeof id === 'string')
      : [],
  };
}

export async function requestTimeAdvance(source: 'tavern' | 'preview', data: Schema) {
  if (source === 'preview') return '预览模式不会发送消息。';

  const { prompt, nextHistory } = pickAdvanceEvent(
    {
      day: data.系统.天数,
      shaping: data.吕青青.塑形度,
      stage: data.吕青青.$阶段,
      roster: data.名册,
    },
    readHistory(),
  );

  await updateVariablesWith(
    vars => {
      vars[HISTORY_KEY] = nextHistory;
      return vars;
    },
    { type: 'chat' },
  );

  await createChatMessages([{ role: 'user', message: prompt, is_hidden: false }], {
    insert_before: 'end',
    refresh: 'affected',
  });
  await triggerSlash('/trigger');
  return '';
}
