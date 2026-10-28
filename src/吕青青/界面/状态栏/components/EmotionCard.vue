<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ emotion: string }>();

const EMOTION_ICONS: Record<string, string> = {
  平静: '😌',
  开心: '😊',
  发情: '😳',
  生气: '😠',
  暴怒: '😡',
  伤心: '😢',
  无语: '😑',
  害羞: '☺️',
};

const icon = computed(() => EMOTION_ICONS[props.emotion] ?? '😌');
</script>

<template>
  <section class="card emotion-card">
    <span class="card-label">当前情绪</span>
    <div class="orb">
      <span class="orb-icon">{{ icon }}</span>
      <span class="orb-ring"></span>
    </div>
    <span class="emotion-name">{{ emotion }}</span>
  </section>
</template>

<style scoped>
.emotion-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.orb {
  position: relative;
  width: 74px;
  height: 74px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.4), transparent 55%),
    linear-gradient(145deg, color-mix(in srgb, var(--c-accent) 70%, transparent), color-mix(in srgb, var(--c-accent) 25%, transparent));
  box-shadow:
    0 0 24px color-mix(in srgb, var(--c-accent) 55%, transparent),
    0 0 8px color-mix(in srgb, var(--c-accent) 40%, transparent) inset;
  animation: orb-pulse 2.6s ease-in-out infinite;
  transition: background 0.6s ease;
}

.orb-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 1.5px dashed color-mix(in srgb, var(--c-accent) 60%, transparent);
  animation: orb-spin 9s linear infinite;
}

.orb-icon { font-size: 34px; filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35)); }

.emotion-name {
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--c-accent);
  text-shadow: 0 0 14px color-mix(in srgb, var(--c-accent) 60%, transparent);
  transition: color 0.5s ease;
}

@keyframes orb-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}
@keyframes orb-spin {
  to { transform: rotate(360deg); }
}
</style>
