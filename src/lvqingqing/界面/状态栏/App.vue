<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Schema } from '../../schema';
import { useDataStore, resolvePreviewData, readPreviewUser } from './store';
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

// 吴恬恬状态栏解锁条件: 她已在剧情中登场
const wt_unlocked = computed(() => data.value.系统.已登场?.['吴恬恬'] === true);

// 吴恬恬登场剧情种子 (占位文本, 待卡作者以正式剧情替换; 注入时替换玩家名)
function buildArrivalSeed(): string {
  const name = player_name.value;
  return [
    '# 一次性剧情指令 (仅对本次生成生效)',
    `接下来请描写「吴恬恬初登场」的完整剧情段落。`,
    `背景: ${name} 的异种娘社会化修复公司今天接收了一批新的战俘异种娘。其中有一只濒死的银白色猫娘——吴恬恬 (16岁, 158cm, 病弱纤细, 患有严重胃病, 曾多次被前主人退回)。`,
    `要求:`,
    `- ${name} 亲自接收并救治她: 把她抱到温暖的床上、盖上最软的被子、给她适合病弱肠胃的温热食物 (对应她人设中的记忆锚点)`,
    `- 描写她初见 ${name} 时小心翼翼的依恋, 符合「病树繁花」的核心意象`,
    `- 剧情段落结束时, 吴恬恬正式开始在该公司生活`,
    `- 本段剧情不要推进其他主线, 不要跳过救治过程中的细节`,
  ].join('\n');
}

async function onSpecialEvent() {
  if (props.source !== 'tavern' || typeof generate !== 'function' || typeof injectPrompts !== 'function') {
    console.info('[lvqingqing] special event clicked (preview, 未连接酒馆)');
    return;
  }
  if (wt_unlocked.value) {
    // TODO: 吴恬恬登场后的后续特殊事件机制, 由卡作者后续提供
    console.info('[lvqingqing] 吴恬恬已登场, 后续特殊事件机制待接入');
    return;
  }

  console.info('[lvqingqing] 触发吴恬恬登场剧情');
  // 一次性注入剧情种子: 仅对下一次生成生效, 不影响世界书提示词
  injectPrompts(
    [
      {
        id: 'wutiantian-arrival-seed',
        position: 'in_chat',
        depth: 2,
        role: 'system',
        content: buildArrivalSeed(),
      },
    ],
    { once: true },
  );

  try {
    await generate({ user_input: '（新的一天，公司来了一批新的异种娘——命运的齿轮开始转动）' });

    // 登场剧情生成完毕: 在最新楼层写入登场标记并初始化吴恬恬变量,
    // 状态栏依赖的 store 会轮询同步, 解锁随之生效 (MVU 继承会把标记带向之后的所有楼层)
    updateVariablesWith(
      variables => {
        _.set(variables, 'stat_data.系统.已登场.吴恬恬', true);
        if (_.get(variables, 'stat_data.吴恬恬') === undefined) {
          _.set(variables, 'stat_data.吴恬恬', { 养分值: 20, 心声: '', 情绪: '平静' });
        }
      },
      { type: 'message', message_id: 'latest' },
    );
  } catch (error) {
    console.error('[lvqingqing] 登场剧情生成失败', error);
  }
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
      @special-event="onSpecialEvent"
    />
    <WutiantianPanel
      v-else
      :player-name="player_name"
      :day="data.系统.天数"
      :heroine="data.吴恬恬"
      :locked="!wt_unlocked"
      @special-event="onSpecialEvent"
    />
  </div>
</template>

<style scoped>
.app-root { display: flex; flex-direction: column; gap: 10px; }
</style>
