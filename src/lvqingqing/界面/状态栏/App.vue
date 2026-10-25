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

function onSpecialEvent() {
  // TODO: 「特殊事件」触发机制由卡作者后续提供 (如: 下一个女主角登场的剧情推进)
  if (typeof generate === 'function') {
    console.info('[lvqingqing] special event triggered in tavern (机制待接入)');
  } else {
    console.info('[lvqingqing] special event clicked (preview)');
  }
}
</script>

<template>
  <div class="app-root">
    <HeroSwitcher :model-value="current" :focused="focused" @update:model-value="active = $event" />

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
      @special-event="onSpecialEvent"
    />
  </div>
</template>

<style scoped>
.app-root { display: flex; flex-direction: column; gap: 10px; }
</style>
