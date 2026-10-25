<script setup lang="ts">
defineProps<{ name: string; day: number; stage: string }>();
</script>

<template>
  <header class="header">
    <div class="who">
      <span class="name-pill">🐾 {{ name }}</span>
      <span class="day-chip">第 {{ day }} 天</span>
    </div>
    <span class="stage-badge">{{ stage }}</span>
  </header>
</template>

<style scoped>
.header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.who { display: flex; align-items: center; gap: 10px; min-width: 0; }

.name-pill {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--c-stage) 50%, transparent);
  background: linear-gradient(120deg, color-mix(in srgb, var(--c-stage) 22%, transparent), transparent);
  color: var(--c-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.day-chip {
  font-size: 12px;
  color: var(--c-text-muted);
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px dashed var(--c-border-glass);
  white-space: nowrap;
}

.stage-badge {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--c-stage);
  padding: 5px 16px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--c-stage) 55%, transparent);
  background: color-mix(in srgb, var(--c-stage) 14%, transparent);
  box-shadow: 0 0 16px color-mix(in srgb, var(--c-stage) 30%, transparent);
  white-space: nowrap;
}
</style>
