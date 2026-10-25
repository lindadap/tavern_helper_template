<script setup lang="ts">
defineProps<{ identity: string; stage: string }>();
</script>

<template>
  <section class="card identity-card">
    <span class="card-label">她眼中的自己</span>
    <p class="identity-text">{{ identity }}</p>
    <span class="stage-sub">{{ stage }} · 进行中</span>
  </section>
</template>

<style scoped>
.identity-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background:
    linear-gradient(120deg, color-mix(in srgb, var(--c-stage) 10%, transparent), transparent 45%),
    linear-gradient(150deg, var(--c-surface-strong), var(--c-surface));
}

.identity-text {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
  background: linear-gradient(100deg, var(--c-text-primary) 30%, var(--c-stage));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.stage-sub {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--c-text-muted);
}
</style>
