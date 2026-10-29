<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ value: number; stage: string }>();

// 养分 0-200。显示宽度按阶段均分, 数值本身仍按 0/40/90/140/190 分段。
const ZONES = [
  { name: '初始', start: 0, end: 40, width: 20 },
  { name: '纤细', start: 40, end: 90, width: 20 },
  { name: '匀称', start: 90, end: 140, width: 20 },
  { name: '丰满', start: 140, end: 190, width: 20 },
  { name: '超重', start: 190, end: 200, width: 20 },
];

const fill_pct = computed(() => {
  const n = Math.min(200, Math.max(0, props.value));
  const index = Math.max(0, ZONES.findIndex(z => n <= z.end));
  const zone = ZONES[index];
  const before = ZONES.slice(0, index).reduce((sum, z) => sum + z.width, 0);
  const in_zone = (n - zone.start) / (zone.end - zone.start);
  return before + in_zone * zone.width;
});

const zone_offsets = ZONES.map((_, i) => ZONES.slice(0, i).reduce((sum, z) => sum + z.width, 0));
</script>

<template>
  <section class="card nutrition-card">
    <div class="meter-head">
      <span class="card-label">养分值</span>
      <span class="meter-value">{{ Math.round(value) }} <i>/ 200</i></span>
    </div>

    <div class="bar-container">
      <span
        v-for="(z, i) in ZONES"
        :key="z.name"
        class="zone"
        :class="{ active: stage === z.name }"
        :style="{ left: zone_offsets[i] + '%', width: z.width + '%' }"
      ></span>
      <div class="bar-fill" :style="{ width: fill_pct + '%' }">
        <span class="bar-shimmer"></span>
      </div>
    </div>

    <div class="zone-marks">
      <span
        v-for="z in ZONES"
        :key="z.name"
        class="zone-name"
        :class="{ active: stage === z.name }"
        :style="{ width: z.width + '%' }"
      >{{ z.name }}</span>
    </div>
  </section>
</template>

<style scoped>
.nutrition-card { width: 100%; }

.meter-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.meter-value {
  font-size: 17px;
  font-weight: 700;
  color: var(--c-stage);
  text-shadow: 0 0 12px color-mix(in srgb, var(--c-stage) 50%, transparent);
}
.meter-value i { font-style: normal; font-size: 11px; color: var(--c-text-muted); }

.bar-container {
  position: relative;
  height: 18px;
  border-radius: 999px;
  background: var(--c-bar-track, rgba(0, 0, 0, 0.32));
  border: 1px solid var(--c-border-glass);
  overflow: hidden;
  margin: 4px 0 6px;
}

/* 分区底色与分隔 */
.zone {
  position: absolute;
  top: 0;
  bottom: 0;
  border-right: 1.5px dashed rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.03);
  transition: background 0.5s ease;
}
.zone:last-of-type { border-right: none; }
.zone.active { background: color-mix(in srgb, var(--c-stage) 16%, transparent); }

.bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #d9b48f 0%, #eec9c0 30%, #f4b3c6 60%, #ee7fb4 100%);
  box-shadow: 0 0 14px color-mix(in srgb, var(--c-stage) 60%, transparent);
  transition: width 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
}

/* 流光 */
.bar-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent 20%, rgba(255, 255, 255, 0.5) 50%, transparent 80%);
  background-size: 220% 100%;
  animation: shimmer 2.8s linear infinite;
}

.zone-marks {
  display: flex;
  font-size: 10.5px;
  letter-spacing: 1.5px;
  color: var(--c-text-muted);
}
.zone-name {
  text-align: center;
  transition: color 0.4s ease, text-shadow 0.4s ease;
}
.zone-name.active {
  color: var(--c-stage);
  font-weight: 700;
  text-shadow: 0 0 10px color-mix(in srgb, var(--c-stage) 60%, transparent);
}

@keyframes shimmer {
  from { background-position: 130% 0; }
  to { background-position: -130% 0; }
}
</style>
