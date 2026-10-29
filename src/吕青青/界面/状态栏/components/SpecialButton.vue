<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ hint?: boolean }>();
const emit = defineEmits<{ trigger: [] }>();
const open = ref(false);

function confirm() {
  open.value = false;
  emit('trigger');
}
</script>

<template>
  <footer class="action-bar">
    <button class="special-button" :class="{ hint }" type="button" @click="open = true">
      <span class="button-face">✦ 触发事件</span>
      <span class="button-shine" aria-hidden="true"></span>
    </button>

    <div v-if="open" class="confirm-mask" @click.self="open = false">
      <section class="confirm-card">
        <p class="confirm-title">时间会向前走</p>
        <p class="confirm-text">确认后，接下来时间会前进 2–5 天，并触发一个事件。</p>
        <div class="confirm-actions">
          <button class="ghost" type="button" @click="open = false">先等等</button>
          <button class="solid" type="button" @click="confirm">确认触发</button>
        </div>
      </section>
    </div>
  </footer>
</template>

<style scoped>
.action-bar {
  position: relative;
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.special-button {
  position: relative;
  overflow: hidden;
  border: none;
  cursor: pointer;
  padding: 7px 18px;
  border-radius: 999px;
  background: linear-gradient(100deg, var(--c-primary), color-mix(in srgb, var(--c-accent) 70%, var(--c-primary)) 55%, var(--c-stage));
  background-size: 200% 100%;
  box-shadow:
    0 4px 14px color-mix(in srgb, var(--c-primary) 40%, transparent),
    0 0 0 1px rgba(255, 255, 255, 0.18) inset;
  transition: background-position 0.5s ease, transform 0.15s ease, box-shadow 0.3s ease;
}

.special-button:hover {
  background-position: 100% 0;
  box-shadow:
    0 6px 18px color-mix(in srgb, var(--c-accent) 50%, transparent),
    0 0 0 1px rgba(255, 255, 255, 0.3) inset;
}

.special-button:active { transform: scale(0.94); }

.button-face {
  position: relative;
  z-index: 1;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #ffffff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

/* 斜向扫光 */
.button-shine {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 34%;
  left: -50%;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.55), transparent);
  transform: skewX(-18deg);
  animation: shine-sweep 4.2s ease-in-out infinite;
}

.special-button.hint {
  animation: hint-glow 1.6s ease-in-out infinite;
}

@keyframes shine-sweep {
  0%, 55% { left: -50%; }
  100% { left: 130%; }
}

@keyframes hint-glow {
  0%, 100% { box-shadow: 0 4px 14px color-mix(in srgb, var(--c-primary) 40%, transparent), 0 0 0 1px rgba(255, 255, 255, 0.18) inset; }
  50% { box-shadow: 0 0 22px color-mix(in srgb, var(--c-stage) 80%, white), 0 0 0 1px rgba(255, 255, 255, 0.55) inset; }
}

.confirm-mask {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(12, 10, 18, 0.55);
}

.confirm-card {
  width: min(320px, 100%);
  padding: 16px;
  border-radius: 16px;
  background: var(--c-surface-strong, #241c2e);
  border: 1px solid var(--c-border-glass);
}

.confirm-title { margin: 0 0 8px; font-weight: 700; letter-spacing: 1px; }
.confirm-text { margin: 0; font-size: 13px; line-height: 1.6; color: var(--c-text-muted); }
.confirm-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; }
.confirm-actions button { border: none; border-radius: 999px; padding: 7px 14px; cursor: pointer; }
.ghost { background: transparent; color: var(--c-text-muted); }
.solid { background: var(--c-primary); color: white; font-weight: 700; }
</style>
