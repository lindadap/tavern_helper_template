<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ value: number; stage: string }>();

// 占位上限与分段阈值 (kg), 待世界书定稿后同步
const MAX = 100;
const TICKS = [46, 58, 72];

const fill_width = computed(() => `${Math.min(100, (props.value / MAX) * 100)}%`);
</script>

<template>
  <section class="card weight-card">
    <div class="meter-head">
      <span class="card-label">体重</span>
      <span class="meter-value">{{ value }} <i>kg</i></span>
    </div>

    <div class="bar-container">
      <div class="bar-fill" :style="{ width: fill_width }">
        <span class="bar-shimmer"></span>
      </div>
      <span
        v-for="t in TICKS"
        :key="t"
        class="bar-tick"
        :class="{ passed: value > t }"
        :style="{ left: `${(t / MAX) * 100}%` }"
      ></span>
    </div>

    <div class="bar-marks">
      <span :class="{ active: stage === '纤细' }">纤细</span>
      <span :class="{ active: stage === '匀称' }">匀称</span>
      <span :class="{ active: stage === '丰满' }">丰满</span>
      <span :class="{ active: stage === '超重' }">超重</span>
    </div>
  </section>
</template>

<style scoped>
.weight-card { width: 100%; }

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
  background: rgba(0, 0, 0, 0.38);
  border: 1px solid var(--c-border-glass);
  overflow: hidden;
  margin: 4px 0 6px;
}

.bar-fill {
  position: relative;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #d9b48f 0%, #eec3ad 30%, #f4b3c6 60%, #ee7fb4 100%);
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

.bar-tick {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background: rgba(255, 255, 255, 0.35);
  transform: translateX(-1px);
  transition: background 0.4s ease;
}
.bar-tick.passed { background: rgba(31, 19, 12, 0.75); }

.bar-marks {
  display: flex;
  justify-content: space-between;
  font-size: 10.5px;
  letter-spacing: 1.5px;
  color: var(--c-text-muted);
}
.bar-marks span { transition: color 0.4s ease, text-shadow 0.4s ease; }
.bar-marks span.active {
  color: var(--c-stage);
  font-weight: 700;
  text-shadow: 0 0 10px color-mix(in srgb, var(--c-stage) 60%, transparent);
}

@keyframes shimmer {
  from { background-position: 130% 0; }
  to { background-position: -130% 0; }
}
</style>
