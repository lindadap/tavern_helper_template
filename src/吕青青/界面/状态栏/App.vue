<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Schema } from '../../schema';
import { useDataStore, resolvePreviewData, readPreviewUser } from './store';
import { WUTIANTIAN_ARRIVAL_STORY } from './wutiantian-arrival';
import { EVENT_POOL, pickRandomEvent } from './special-events';
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

function buildArrivalSeed(): string {
  const name = player_name.value;
  const story = WUTIANTIAN_ARRIVAL_STORY.replaceAll('{{user}}', name);
  return [
    '# 一次性剧情指令 (仅对本次生成生效)',
    '请以以下剧本为大纲，演出「吴恬恬初登场」。可以展开有趣的细节，但不得跳过关键节点，也不得替玩家做决定。',
    '关键节点: 深夜来电 → 航空箱接收 → 昏迷救治与每日陪伴 → 公主苏醒 → 停在剧情分支点，列出选项。',
    '',
    story,
  ].join('\n');
}

function presentNames(): string {
  const latest = getChatMessages(-1)[0]?.message ?? '';
  const names = ['吕青青', '吴恬恬'].filter(name => latest.includes(name));
  if (names.length) return names.join('，');
  return data.value.系统.当前主角 || '吕青青';
}

async function concealTrigger(eventTitle: string) {
  const latest = getChatMessages('latest')[0];
  if (!latest) return;
  const veiled = `<div class="time-skip">时间推进中。。。</div><!-- 触发事件【${eventTitle}】 -->`;
  await setChatMessages([{ message_id: latest.message_id, message: veiled }], { refresh: 'affected' });
}

async function onSpecialEvent() {
  if (props.source !== 'tavern' || typeof generate !== 'function' || typeof injectPrompts !== 'function') {
    console.info('[lvqingqing] special event clicked (preview, 未连接酒馆)');
    return;
  }
  const ctx = { playerName: player_name.value, focused: focused.value, data: data.value };
  const days = 2 + Math.floor(Math.random() * 4);

  if (!wt_unlocked.value && daily_done.value) {
    const title = '吴恬恬初登场';
    injectPrompts(
      [{ id: 'special-event', position: 'in_chat', depth: 2, role: 'system', content: buildArrivalSeed() }],
      { once: true },
    );
    await generate({ user_input: `触发事件【${title}】在场角色${presentNames()}。地点公司接收区` });
    await concealTrigger(title);
    updateVariablesWith(
      variables => {
        _.set(variables, 'stat_data.系统.已登场.吴恬恬', true);
        _.set(variables, 'stat_data.系统.天数', (Number(_.get(variables, 'stat_data.系统.天数')) || 1) + days);
        if (_.get(variables, 'stat_data.吴恬恬') === undefined) {
          _.set(variables, 'stat_data.吴恬恬', { 养分值: 20, 已结算阶段: '初始', 心声: '', 情绪: '平静' });
        }
      },
      { type: 'message', message_id: 'latest' },
    );
    return;
  }

  const pool = EVENT_POOL.filter(event => event.requires !== 'wutiantian' || wt_unlocked.value);
  const event = pickRandomEvent(ctx, pool);
  if (!event) return;
  injectPrompts(
    [{
      id: 'special-event',
      position: 'in_chat',
      depth: 2,
      role: 'system',
      content: `${event.build(ctx)}\n时间前进 ${days} 天。按大纲发挥，不替玩家做决定。`,
    }],
    { once: true },
  );
  await generate({
    user_input: `触发事件【${event.title}】在场角色${presentNames()}。地点${event.location}`,
  });
  await concealTrigger(event.title);
  updateVariablesWith(
    variables => {
      const next = (Number(_.get(variables, 'stat_data.系统.日常已触发')) || 0) + 1;
      _.set(variables, 'stat_data.系统.日常已触发', next);
      _.set(variables, 'stat_data.系统.天数', (Number(_.get(variables, 'stat_data.系统.天数')) || 1) + days);
      if (event.id === 'wt-stomach-flare') {
        _.set(variables, 'stat_data.吴恬恬.养分值', 60);
        _.set(variables, 'stat_data.吴恬恬.已结算阶段', '纤细');
      }
    },
    { type: 'message', message_id: 'latest' },
  );
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
