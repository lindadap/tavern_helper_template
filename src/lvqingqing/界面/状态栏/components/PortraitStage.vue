<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  emotion: string;
  portraits: Record<string, string>;
  heroineName: string;
  /** 立绘选择键: 吕青青按情绪, 吴恬恬按阶段; 缺省时按情绪 */
  portraitKey?: string;
}>();

const portrait_src = computed(
  () => props.portraits[props.portraitKey ?? props.emotion] ?? Object.values(props.portraits)[0],
);
const failed = ref(false);

function onPortraitError() {
  console.warn('[lvqingqing] 立绘加载失败:', portrait_src.value);
  failed.value = true;
}
</script>

<template>
  <figure class="portrait-stage">
    <div class="portrait-frame" :class="{ failed }">
      <img v-if="!failed" :src="portrait_src" :alt="`${heroineName}·${emotion}`" @error="onPortraitError" />
      <div v-else class="portrait-placeholder">
        <span class="placeholder-icon">🌸</span>
        <span class="placeholder-text">立绘加载中…</span>
      </div>
      <span class="frame-gloss" aria-hidden="true"></span>
    </div>

    <figcaption class="portrait-caption">{{ emotion }} · {{ heroineName }}</figcaption>
  </figure>
</template>

<style scoped>
.portrait-stage {
  --pw: min(82vw, 330px);
  position: relative;
  margin: 14px 0 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.portrait-frame {
  position: relative;
  width: var(--pw);
  aspect-ratio: 832 / 1216;
  border-radius: 18px 18px 44% 44% / 18px 18px 26% 26%;
  overflow: hidden;
  border: 1.5px solid color-mix(in srgb, var(--c-accent) 55%, var(--c-border-glass));
  background:
    radial-gradient(circle at 50% 118%, color-mix(in srgb, var(--c-stage) 30%, transparent), transparent 62%),
    linear-gradient(165deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02));
  box-shadow:
    0 10px 30px color-mix(in srgb, rgba(0, 0, 0, 0.5), rgba(70, 100, 170, 0.28) var(--shadow-tint, 0%)),
    0 0 22px color-mix(in srgb, var(--c-accent) 30%, transparent);
  animation: portrait-breathe 5.5s ease-in-out infinite;
  transition: border-color 0.6s ease;
}

.portrait-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
}

/* 玻璃高光扫过 */
.frame-gloss {
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 30%, rgba(255, 255, 255, 0.16) 46%, transparent 60%);
  background-size: 250% 100%;
  animation: gloss-sweep 6s ease-in-out infinite;
  pointer-events: none;
}

.portrait-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--c-text-muted);
}
.placeholder-icon { font-size: 44px; }
.placeholder-text { font-size: 12px; letter-spacing: 2px; }

.portrait-caption {
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--c-text-muted);
}

@keyframes portrait-breathe {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-4px) scale(1.012); }
}
@keyframes gloss-sweep {
  0%, 55% { background-position: 130% 0; }
  100% { background-position: -130% 0; }
}
</style>
