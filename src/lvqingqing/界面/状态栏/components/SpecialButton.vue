<script setup lang="ts">
const emit = defineEmits<{ trigger: [] }>();
</script>

<template>
  <footer class="action-bar">
    <button class="special-button" type="button" @click="emit('trigger')">
      <span class="button-face">✦ 触发事件</span>
      <span class="button-shine" aria-hidden="true"></span>
    </button>
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

@keyframes shine-sweep {
  0%, 55% { left: -50%; }
  100% { left: 130%; }
}
</style>
