import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';
import { Schema } from '../../schema';

const STATUS_URL =
  'https://testingcf.jsdelivr.net/gh/lindadap/tavern_helper_template@v2.5.1/dist/吕青青/界面/状态栏/index.html';

function mountStatus(messageId: number) {
  const host = $(`#chat .mes[mesid="${messageId}"]`).find('.lvqingqing-status-slot').last();
  if (!host.length || host.attr('data-mounted') === '1') return;
  host.attr('data-mounted', '1').load(STATUS_URL);
}

function mountVisible() {
  $('#chat .mes').each((_, element) => {
    const id = Number($(element).attr('mesid'));
    if (Number.isFinite(id)) mountStatus(id);
  });
}

$(() => {
  registerMvuSchema(Schema);
  eventOn(tavern_events.CHARACTER_MESSAGE_RENDERED, messageId => mountStatus(messageId));
  eventOn(tavern_events.CHAT_CHANGED, () => setTimeout(mountVisible, 300));
  setTimeout(mountVisible, 300);
});

