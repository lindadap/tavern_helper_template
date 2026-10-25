<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{ emotion: string }>();

// 各情绪的立绘链接 (meee.com.tw 图床); 拿到全部立绘后逐个替换即可
const PORTRAITS: Record<string, string> = {
  平静: 'https://i.meee.com.tw/n4rMVzn.png',
  开心: 'https://i.meee.com.tw/n4rMVzn.png',
  发情: 'https://i.meee.com.tw/n4rMVzn.png',
  生气: 'https://i.meee.com.tw/n4rMVzn.png',
  暴怒: 'https://i.meee.com.tw/n4rMVzn.png',
  伤心: 'https://i.meee.com.tw/n4rMVzn.png',
  无语: 'https://i.meee.com.tw/n4rMVzn.png',
  害羞: 'https://i.meee.com.tw/n4rMVzn.png',
};

const portrait_src = computed(() => PORTRAITS[props.emotion] ?? PORTRAITS['平静']);
const failed = ref(false);

function onPortraitError() {
  console.warn('[lvqingqing] 立绘加载失败:', portrait_src.value);
  failed.value = true;
}
</script>

<template>
  <figure class="portrait-stage">
    <span class="halo" aria-hidden="true"></span>
    <span class="halo halo-2" aria-hidden="true"></span>

    <div class="portrait-frame" :class="{ failed }">
      <img v-if="!failed" :src="portrait_src" :alt="`吕青青·${emotion}`" @error="onPortraitError" />
      <div v-else class="portrait-placeholder">
        <span class="placeholder-icon">🦊</span>
        <span class="placeholder-text">立绘加载中…</span>
      </div>
      <span class="frame-gloss" aria-hidden="true"></span>
    </div>

    <figcaption class="portrait-caption">{{ emotion }} · 吕青青</figcaption>
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

/* 旋转光晕 (随立绘尺寸缩放) */
.halo {
  position: absolute;
  top: 44%;
  left: 50%;
  width: calc(var(--pw) * 1.24);
  aspect-ratio: 1;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    color-mix(in srgb, var(--c-accent) 65%, transparent) 70deg,
    transparent 150deg,
    color-mix(in srgb, var(--c-stage) 55%, transparent) 250deg,
    transparent 330deg
  );
  filter: blur(15px);
  opacity: 0.75;
  animation: halo-rotate 11s linear infinite;
  pointer-events: none;
}
.halo-2 {
  width: calc(var(--pw) * 1.06);
  filter: blur(26px);
  opacity: 0.4;
  animation-duration: 17s;
  animation-direction: reverse;
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
    0 10px 30px color-mix(in srgb, rgba(0, 0, 0, 0.5), rgba(70, 100, 170, 0.28) var(--porcelain)),
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

@keyframes halo-rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
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
