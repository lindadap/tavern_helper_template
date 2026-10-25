<script setup lang="ts">
defineProps<{
  modelValue: 'lvqingqing' | 'wutiantian';
  focused: 'lvqingqing' | 'wutiantian';
  /** 处于锁定 (未登场) 状态的女主角 key */
  locked?: string[];
}>();

const emit = defineEmits<{ 'update:modelValue': ['lvqingqing' | 'wutiantian'] }>();

const HEROINES = [
  { key: 'lvqingqing', label: '吕青青' },
  { key: 'wutiantian', label: '吴恬恬' },
] as const;
</script>

<template>
  <nav class="hero-switcher" aria-label="切换女主角">
    <button
      v-for="h in HEROINES"
      :key="h.key"
      type="button"
      class="switch-pill"
      :class="{ active: modelValue === h.key }"
      @click="emit('update:modelValue', h.key)"
    >
      <span v-if="focused === h.key" class="focus-star" title="当前主角">★</span>
      <span v-if="locked?.includes(h.key)" class="lock-mark" title="尚未登场">🔒</span>
      {{ h.label }}
    </button>
  </nav>
</template>

<style scoped>
.hero-switcher {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.switch-pill {
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(20, 26, 58, 0.55);
  backdrop-filter: blur(8px);
  color: rgba(238, 242, 255, 0.75);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 2px;
  padding: 6px 18px;
  transition: all 0.25s ease;
}

.switch-pill:hover { color: #ffffff; border-color: rgba(255, 255, 255, 0.35); }

.switch-pill.active {
  color: #ffffff;
  background: linear-gradient(100deg, #8b7cf6, #5eb3e4);
  border-color: transparent;
  box-shadow: 0 4px 14px rgba(124, 108, 246, 0.4);
}

.focus-star {
  font-size: 11px;
  color: #ffd166;
  margin-right: 3px;
  text-shadow: 0 0 6px rgba(255, 209, 102, 0.8);
}

.lock-mark {
  font-size: 10px;
  margin-right: 3px;
  opacity: 0.85;
}
</style>
