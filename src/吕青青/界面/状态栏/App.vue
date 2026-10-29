<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Schema } from '../../schema';
import { useDataStore, resolvePreviewData, readPreviewUser } from './store';
import { WUTIANTIAN_ARRIVAL_STORY } from './wutiantian-arrival';
import { pickRandomEvent } from './special-events';
import HeroSwitcher from './components/HeroSwitcher.vue';
import LvqingqingPanel from './components/lvqingqing/LvqingqingPanel.vue';
import WutiantianPanel from './components/wutiantian/WutiantianPanel.vue';

const props = defineProps<{ source: 'tavern' | 'preview' }>();

const tavern_store = props.source === 'tavern' ? useDataStore() : undefined;
const preview_data = ref(resolvePreviewData());
const data = computed<Schema>(() => (tavern_store ? tavern_store.data : preview_data.value));

// 玩家名: 酒馆内替换 {{user}} 宏, 预览模式读 fragment 的 user 字段
const player_name = computed(() => {
  if (props.source === 'tavern' && typeof substitudeMacros === 'function') {
    return substitudeMacros('{{user}}');
  }
  return readPreviewUser();
});

// 当前剧情聚焦的女主角 (来自 系统.当前主角), 作为切换器的默认人选
const focused = computed<'lvqingqing' | 'wutiantian'>(() =>
  data.value.系统.当前主角 === '吴恬恬' ? 'wutiantian' : 'lvqingqing',
);
const active = ref<'lvqingqing' | 'wutiantian' | null>(null);
const current = computed(() => active.value ?? focused.value);

const wt_unlocked = computed(() => data.value.系统.已登场?.['吴恬恬'] === true);
const daily_done = computed(() => (data.value.系统.日常已触发 ?? 0) > 0);
const event_hint = computed(() => daily_done.value && !wt_unlocked.value);
const lq_absent = computed(() => data.value.系统.当前主角 !== '吕青青');
const wt_absent = computed(() => data.value.系统.当前主角 !== '吴恬恬');

// 吴恬恬登场剧情种子: 以卡作者提供的完整剧本为大纲, 注入时替换玩家名
function buildArrivalSeed(): string {
  const name = player_name.value;
  const story = WUTIANTIAN_ARRIVAL_STORY.replaceAll('{{user}}', name);
  return [
    '# 一次性剧情指令 (仅对本次生成生效)',
    '请按照下方剧本的脉络，以角色扮演叙事的方式完整演出「吴恬恬初登场」的剧情。',
    '要求:',
    '- 不要照抄原文：以剧本为大纲自然展开叙事，保留全部关键节点与细节（深夜来电 → 航空箱接收 → 昏迷救治与每日陪伴 → 公主苏醒）',
    `- 剧本中出现的 {{user}} 即玩家 ${name}，按其已发生的行动对待`,
    '- 演到【剧情分支点】处停下：列出三个选项等待玩家选择，不要替玩家做决定',
    '- 本段剧情不要推进其他主线，不要跳过救治过程中的细节',
    '',
    '---',
    '',
    story,
  ].join('\n');
}

async function onSpecialEvent() {
  if (props.source !== 'tavern' || typeof generate !== 'function' || typeof injectPrompts !== 'function') {
    console.info('[lvqingqing] special event clicked (preview, 未连接酒馆)');
    return;
  }
  if (!daily_done.value) {
    console.info('[lvqingqing] 日常事件池还没有移植，已停止，不生成剧情');
    return;
  }
  if (!wt_unlocked.value) {
    console.info('[lvqingqing] 吴恬恬进场正文还没有移植，已停止，不解锁');
    return;
  }

  const event = pickRandomEvent({ playerName: player_name.value, focused: focused.value, data: data.value });
  if (!event) {
    console.info('[lvqingqing] 当前没有可用的事件');
    return;
  }
    console.info('[lvqingqing] 触发特殊事件:', event.title);
    injectPrompts(
      [{ id: 'special-event', position: 'in_chat', depth: 2, role: 'system', content: event.build({ playerName: player_name.value, focused: focused.value, data: data.value }) }],
      { once: true },
    );
    try {
      await generate({ user_input: '（一段特别的小剧情，就此展开）' });
    } catch (error) {
      console.error('[lvqingqing] 特殊事件生成失败', error);
    }
    return;
  }
</script>

<template>
  <div class="app-root">
    <HeroSwitcher
      :model-value="current"
      :focused="focused"
      :locked="wt_unlocked ? [] : ['wutiantian']"
      @update:model-value="active = $event"
    />

    <LvqingqingPanel
      v-if="current === 'lvqingqing'"
      :player-name="player_name"
      :day="data.系统.天数"
      :heroine="data.吕青青"
      :absent="lq_absent"
      :event-hint="event_hint"
      @special-event="onSpecialEvent"
    />
    <WutiantianPanel
      v-else
      :player-name="player_name"
      :day="data.系统.天数"
      :heroine="data.吴恬恬"
      :locked="!wt_unlocked"
      :absent="wt_absent"
      :event-hint="event_hint"
      @special-event="onSpecialEvent"
    />
  </div>
</template>

<style scoped>
.app-root { display: flex; flex-direction: column; gap: 10px; }
</style>
