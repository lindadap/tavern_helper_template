<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Schema } from '../../schema';
import { useDataStore, resolvePreviewData } from './store';
import HeaderBar from './components/HeaderBar.vue';
import EmotionCard from './components/EmotionCard.vue';
import IdentityCard from './components/IdentityCard.vue';
import PortraitStage from './components/PortraitStage.vue';
import ShapingMeter from './components/ShapingMeter.vue';
import VoiceCard from './components/VoiceCard.vue';
import SpecialButton from './components/SpecialButton.vue';

const props = defineProps<{ source: 'tavern' | 'preview' }>();

const tavern_store = props.source === 'tavern' ? useDataStore() : undefined;
const preview_data = ref(resolvePreviewData());
const data = computed<Schema>(() => (tavern_store ? tavern_store.data : preview_data.value));

// 塑形度 → 白瓷化比例 (0~1): 越高整体越白, 与现有配色调和出青花瓷质感
const whiteness = computed(() => data.value.吕青青.塑形度 / 200);

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
  <div
    class="status-root"
    :data-emotion="data.吕青青.情绪"
    :data-stage="data.吕青青.$阶段"
    :style="{ '--whiteness': String(whiteness) }"
  >
    <div class="aurora a1" aria-hidden="true"></div>
    <div class="aurora a2" aria-hidden="true"></div>
    <div class="aurora a3" aria-hidden="true"></div>
    <div class="glaze" aria-hidden="true"></div>
    <div class="particles" aria-hidden="true"><i v-for="n in 8" :key="n"></i></div>

    <HeaderBar :name="data.系统.当前主角" :day="data.系统.天数" :stage="data.吕青青.$阶段" />

    <main class="stack">
      <PortraitStage :emotion="data.吕青青.情绪" />
      <ShapingMeter :value="data.吕青青.塑形度" :stage="data.吕青青.$阶段" />

      <div class="info-row">
        <EmotionCard :emotion="data.吕青青.情绪" />
        <IdentityCard :identity="data.吕青青.$身份认知" :stage="data.吕青青.$阶段" />
      </div>

      <VoiceCard :voice="data.吕青青.心声" />
    </main>

    <SpecialButton @trigger="onSpecialEvent" />
  </div>
</template>
