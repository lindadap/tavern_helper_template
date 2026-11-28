import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';
import { Schema } from '../../schema';
import { applyPostUpdateRules } from './limits';

function readRecentMessagePair(): { lastAiMessage: string; lastUserMessage: string } {
  try {
    if (typeof getChatMessages !== 'function') return { lastAiMessage: '', lastUserMessage: '' };
    const lastId = typeof getLastMessageId === 'function' ? getLastMessageId() : -1;
    const range = lastId >= 0 ? `${Math.max(0, lastId - 3)}-${lastId}` : -1;
    const msgs = getChatMessages(range);
    let lastAiMessage = '';
    let lastUserMessage = '';
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      if (!m || typeof m.message !== 'string') continue;
      if (!lastAiMessage && m.role === 'assistant') lastAiMessage = m.message;
      if (!lastUserMessage && m.role === 'user') lastUserMessage = m.message;
      if (lastAiMessage && lastUserMessage) break;
    }
    return { lastAiMessage, lastUserMessage };
  } catch {
    return { lastAiMessage: '', lastUserMessage: '' };
  }
}

async function start() {
  await waitGlobalInitialized('Mvu');
  registerMvuSchema(Schema);
  eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, (variables, previous) => {
    const { lastAiMessage, lastUserMessage } = readRecentMessagePair();
    applyPostUpdateRules(variables?.stat_data, previous?.stat_data, {
      lastAiMessage,
      lastUserMessage,
    });
  });
  console.info('[拌面园区] 单角色变量结构已注册');
}

$(errorCatched(start));
