// 作者确认后在此填写发送内容；为空时不发送、不推进天数。
export const TIME_ADVANCE_PROMPT = '';
export async function requestTimeAdvance(source: 'tavern' | 'preview') {
  if (!TIME_ADVANCE_PROMPT.trim()) return '时间推进内容尚未设置。';
  if (source === 'preview') return '预览模式不会发送消息。';
  await createChatMessages([{ role: 'user', message: TIME_ADVANCE_PROMPT, is_hidden: false }], { insert_before: 'end', refresh: 'affected' });
  await triggerSlash('/trigger');
  return '';
}
