<script setup lang="ts">
defineProps<{ voice: string }>();
</script>

<template>
  <section class="card voice-card">
    <span class="card-label">💭 心声</span>
    <p class="voice-text">{{ voice || '（她现在安静得很，什么也没想……大概。）' }}</p>
  </section>
</template>

<style scoped>
.voice-card {
  background:
    linear-gradient(120deg, color-mix(in srgb, var(--c-accent) 12%, transparent), transparent 55%),
    linear-gradient(150deg, var(--c-surface-strong), var(--c-surface));
  border-left: 3px solid var(--c-accent);
  transition: border-left-color 0.5s ease;
}

.voice-text {
  margin: 0;
  font-size: 13.5px;
  font-style: italic;
  line-height: 1.65;
  color: var(--c-text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
