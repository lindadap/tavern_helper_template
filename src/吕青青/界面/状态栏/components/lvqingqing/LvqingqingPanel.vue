<script setup lang="ts">
import { computed } from 'vue';
import type { Schema } from '../../../../schema';
import HeaderBar from '../HeaderBar.vue';
import EmotionCard from '../EmotionCard.vue';
import IdentityCard from '../IdentityCard.vue';
import PortraitStage from '../PortraitStage.vue';
import VoiceCard from '../VoiceCard.vue';
import SpecialButton from '../SpecialButton.vue';
import ShapingMeter from './ShapingMeter.vue';

const props = defineProps<{
  playerName: string;
  day: number;
  heroine: Schema['吕青青'];
  eventHint?: boolean;
  absent?: boolean;
}>();

defineEmits<{ 'special-event': [] }>();

// 吕青青只使用自己的立绘。没有图的情绪不保留, 也不借用相近情绪的脸。
const PORTRAITS: Record<string, readonly string[]> = {
  害羞: [
    'https://i.meee.com.tw/Q5wBeAt.png',
    'https://i.meee.com.tw/o8hxTSh.png',
    'https://i.meee.com.tw/zYz7eC3.png',
    'https://i.meee.com.tw/ibcA8X2.png',
    'https://i.meee.com.tw/4EkOzNd.png',
  ],
  情动: [
    'https://i.meee.com.tw/n4rMVzn.png',
    'https://i.meee.com.tw/Nqvorvk.png',
    'https://i.meee.com.tw/cVA8Fbt.png',
    'https://i.meee.com.tw/zR1dfiN.png',
    'https://i.meee.com.tw/9UXv5Fy.png',
  ],
  生气: [
    'https://i.meee.com.tw/7DrPpC9.png',
    'https://i.meee.com.tw/Bu8Nmix.png',
    'https://i.meee.com.tw/ZXyjI4M.png',
  ],
  平静: ['https://i.meee.com.tw/ZxX87z4.png'],
  高兴: ['https://i.meee.com.tw/UbSYZMt.png', 'https://i.meee.com.tw/QxeGAJD.png'],
  委屈: ['https://i.meee.com.tw/E2lV3Nk.png', 'https://i.meee.com.tw/utqAaD1.png'],
  被安抚: ['https://i.meee.com.tw/GbZDbJf.png'],
  吃醋: ['https://i.meee.com.tw/tWjPdFu.png', 'https://i.meee.com.tw/Xw65mAa.png'],
};

// 塑形度 → 白瓷化比例 (0~1): 越高整体越白, 与现有配色调和出青花瓷质感
const whiteness = computed(() => props.heroine.塑形度 / 200);
</script>

<template>
  <section
    class="lq-root"
    :data-emotion="heroine.情绪"
    :data-stage="heroine.$阶段"
    :style="{ '--whiteness': String(whiteness) }"
  >
    <div class="aurora a1" aria-hidden="true"></div>
    <div class="aurora a2" aria-hidden="true"></div>
    <div class="aurora a3" aria-hidden="true"></div>
    <div class="glaze" aria-hidden="true"></div>
    <div class="particles" aria-hidden="true"><i v-for="n in 8" :key="n"></i></div>

    <HeaderBar :player-name="playerName" :day="day" :stage="heroine.$阶段" />

    <main class="stack" :class="{ 'stack-absent': absent }">
      <div class="portrait-zone">
        <span class="halo" aria-hidden="true"></span>
        <span class="halo halo-2" aria-hidden="true"></span>
        <!-- 青花缠枝纹样环: 妻子期 (whiteness > 0.55) 起, 随塑形度渐显并缓缓旋转 -->
        <div class="pattern-rings" aria-hidden="true">
          <span class="ring ring-outer"></span>
          <span class="ring ring-inner"></span>
        </div>
        <PortraitStage
          :emotion="heroine.情绪"
          :portraits="PORTRAITS"
          :portrait-key="heroine.情绪"
          :seed="`吕青青-${day}-${heroine.情绪}`"
          heroine-name="吕青青"
        />
      </div>

      <ShapingMeter :value="heroine.塑形度" :stage="heroine.$阶段" />

      <div class="info-row">
        <EmotionCard :emotion="absent ? '—' : heroine.情绪" />
        <IdentityCard :identity="absent ? '她现在不在这里' : heroine.$身份认知" :stage="heroine.$阶段" />
      </div>

      <VoiceCard :voice="absent ? '' : heroine.心声" />
    </main>

    <SpecialButton :hint="eventHint" @trigger="$emit('special-event')" />
  </section>
</template>

<style scoped>
.stack-absent {
  filter: grayscale(0.92) brightness(0.72);
  opacity: 0.72;
}

.lq-root {
  --w: var(--whiteness, 0);
  /* 背景随塑形度慢慢变白, 但卡片/文字在窄窗口内陡峭切换, 避免中间灰区对比度塌陷 */
  --cardw: clamp(0, calc((var(--w) - 0.47) / 0.06), 1);
  --porcelain: calc(var(--w) * 100%);
  --cardp: calc(var(--cardw) * 100%);
  --c-text-primary: color-mix(in srgb, #eef2ff, #1e3a5f var(--cardp));
  --c-text-muted: color-mix(in srgb, rgba(230, 236, 255, 0.62), rgba(30, 58, 95, 0.55) var(--cardp));
  --c-surface: color-mix(in srgb, rgba(14, 19, 48, 0.72), rgba(255, 255, 255, 0.88) var(--cardp));
  --c-surface-strong: color-mix(in srgb, rgba(20, 26, 58, 0.82), rgba(255, 255, 255, 0.94) var(--cardp));
  --c-border-glass: color-mix(in srgb, rgba(255, 255, 255, 0.16), rgba(118, 148, 210, 0.55) var(--cardp));
  --c-bar-track: color-mix(in srgb, rgba(0, 0, 0, 0.38), rgba(120, 140, 190, 0.28) var(--cardp));
  --c-primary: color-mix(in srgb, #8b7cf6, #1f3a8f calc(var(--cardp) * 0.3));
  --c-accent: color-mix(in srgb, var(--c-accent-raw), #0c1a33 calc(var(--cardp) * 0.42));
  --c-stage: color-mix(in srgb, var(--c-stage-raw), #122a63 calc(var(--cardp) * 0.38));
  --shadow-tint: var(--cardp);

  position: relative;
  overflow: hidden;
  max-width: 470px;
  margin-inline: auto;
  border-radius: 18px;
  border: 1px solid var(--c-border-glass);
  background:
    radial-gradient(circle at 50% 0%, color-mix(in srgb, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.5) var(--porcelain)), transparent 70%),
    linear-gradient(160deg,
      color-mix(in srgb, #101538, #ffffff var(--porcelain)) 0%,
      color-mix(in srgb, #0a0e27, #f2f6fc calc(var(--porcelain) * 0.9)) 55%,
      color-mix(in srgb, #150f2e, #e8eefb var(--porcelain)) 100%);
  box-shadow:
    0 0 34px color-mix(in srgb, rgba(124, 108, 246, 0.26), rgba(120, 150, 210, 0.3) var(--porcelain)),
    0 14px 40px color-mix(in srgb, rgba(0, 0, 0, 0.45), rgba(90, 120, 180, 0.25) var(--porcelain));
  padding: 16px 14px 14px;
}

/* 极光色块层: 白化时褪为淡青花 */
.aurora {
  position: absolute;
  width: 55%;
  height: 60%;
  border-radius: 50%;
  filter: blur(70px);
  opacity: calc(0.4 - var(--w) * 0.24);
  pointer-events: none;
  mix-blend-mode: screen;
}
.aurora.a1 { top: -22%; left: -12%; background: color-mix(in srgb, #7c6cf6, #dbe7fb var(--porcelain)); animation: aurora-drift-1 22s ease-in-out infinite alternate; }
.aurora.a2 { bottom: -28%; right: -10%; background: color-mix(in srgb, #2dd4bf, #d5e6f8 var(--porcelain)); animation: aurora-drift-2 26s ease-in-out infinite alternate; }
.aurora.a3 { top: 30%; left: 38%; width: 34%; height: 40%; background: color-mix(in srgb, #f472b6, #e3ecfa var(--porcelain)); opacity: calc(0.26 - var(--w) * 0.16); animation: aurora-drift-3 30s ease-in-out infinite alternate; }

/* 瓷釉高光: 随白化浮现 */
.glaze {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: calc(var(--w) * 0.85);
  background: linear-gradient(118deg, transparent 34%, rgba(255, 255, 255, 0.45) 47%, rgba(255, 255, 255, 0.12) 53%, transparent 67%);
}

@keyframes aurora-drift-1 { from { transform: translate(0, 0) scale(1); } to { transform: translate(26%, 18%) scale(1.15); } }
@keyframes aurora-drift-2 { from { transform: translate(0, 0) scale(1.1); } to { transform: translate(-22%, -14%) scale(0.95); } }
@keyframes aurora-drift-3 { from { transform: translate(-10%, 6%) scale(1); } to { transform: translate(14%, -12%) scale(1.2); } }

/* 漂浮光粒 */
.particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.particles i {
  position: absolute;
  bottom: -12px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9), color-mix(in srgb, var(--c-accent) 70%, transparent) 60%, transparent 75%);
  opacity: 0;
  animation: particle-rise linear infinite;
}
.particles i:nth-child(1) { left: 6%;  width: 5px; height: 5px; animation-duration: 11s; animation-delay: 0s; }
.particles i:nth-child(2) { left: 17%; width: 3px; height: 3px; animation-duration: 14s; animation-delay: 2.5s; }
.particles i:nth-child(3) { left: 31%; width: 6px; height: 6px; animation-duration: 12s; animation-delay: 5s; }
.particles i:nth-child(4) { left: 46%; width: 4px; height: 4px; animation-duration: 16s; animation-delay: 1.2s; }
.particles i:nth-child(5) { left: 58%; width: 5px; height: 5px; animation-duration: 13s; animation-delay: 4s; }
.particles i:nth-child(6) { left: 69%; width: 3px; height: 3px; animation-duration: 15s; animation-delay: 6.5s; }
.particles i:nth-child(7) { left: 81%; width: 6px; height: 6px; animation-duration: 11s; animation-delay: 3s; }
.particles i:nth-child(8) { left: 92%; width: 4px; height: 4px; animation-duration: 14s; animation-delay: 7.5s; }

@keyframes particle-rise {
  0%   { transform: translateY(0) translateX(0); opacity: 0; }
  12%  { opacity: 0.85; }
  80%  { opacity: 0.5; }
  100% { transform: translateY(-560px) translateX(18px); opacity: 0; }
}

/* ===== 立绘区: 光晕 + 青花纹样环 ===== */
.portrait-zone {
  --pws: min(82vw, 330px);
  --pwh: calc(var(--pws) * 1216 / 832);
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

.halo {
  position: absolute;
  top: calc(14px + var(--pwh) / 2);
  left: 50%;
  width: calc(var(--pws) * 1.24);
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
  width: calc(var(--pws) * 1.06);
  filter: blur(26px);
  opacity: 0.4;
  animation-duration: 17s;
  animation-direction: reverse;
}

@keyframes halo-rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* 青花缠枝纹样: 妻子期渐显 (whiteness>0.55), 双环反向缓旋, 不遮挡立绘细节 */
.pattern-rings {
  --pat-o: clamp(0, calc((var(--w) - 0.55) / 0.45), 1);
  position: absolute;
  top: calc(14px + var(--pwh) / 2);
  left: 50%;
  width: calc(var(--pws) * 1.18);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.ring {
  position: absolute;
  inset: 0;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  opacity: calc(var(--pat-o) * 0.55);
}

.ring-outer {
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='-6 -6 212 212'><g fill='none' stroke='%232c4f9e' stroke-width='1'><circle cx='100' cy='100' r='95' stroke-dasharray='2 5'/><circle cx='100' cy='100' r='82'/><circle cx='100' cy='100' r='74' stroke-dasharray='1 6'/><g><g transform='translate(188.5 100)'><path d='M0 -7 C2.5 -3.5 2.5 3.5 0 7 C-2.5 3.5 -2.5 -3.5 0 -7Z'/><path d='M-7 0 C-3.5 -2.5 3.5 -2.5 7 0 C3.5 2.5 -3.5 2.5 -7 0Z'/><circle r='1.6' fill='%232c4f9e' stroke='none'/></g><g transform='translate(162.5 162.5)'><path d='M0 -7 C2.5 -3.5 2.5 3.5 0 7 C-2.5 3.5 -2.5 -3.5 0 -7Z'/><path d='M-7 0 C-3.5 -2.5 3.5 -2.5 7 0 C3.5 2.5 -3.5 2.5 -7 0Z'/><circle r='1.6' fill='%232c4f9e' stroke='none'/></g><g transform='translate(100 188.5)'><path d='M0 -7 C2.5 -3.5 2.5 3.5 0 7 C-2.5 3.5 -2.5 -3.5 0 -7Z'/><path d='M-7 0 C-3.5 -2.5 3.5 -2.5 7 0 C3.5 2.5 -3.5 2.5 -7 0Z'/><circle r='1.6' fill='%232c4f9e' stroke='none'/></g><g transform='translate(37.5 162.5)'><path d='M0 -7 C2.5 -3.5 2.5 3.5 0 7 C-2.5 3.5 -2.5 -3.5 0 -7Z'/><path d='M-7 0 C-3.5 -2.5 3.5 -2.5 7 0 C3.5 2.5 -3.5 2.5 -7 0Z'/><circle r='1.6' fill='%232c4f9e' stroke='none'/></g><g transform='translate(11.5 100)'><path d='M0 -7 C2.5 -3.5 2.5 3.5 0 7 C-2.5 3.5 -2.5 -3.5 0 -7Z'/><path d='M-7 0 C-3.5 -2.5 3.5 -2.5 7 0 C3.5 2.5 -3.5 2.5 -7 0Z'/><circle r='1.6' fill='%232c4f9e' stroke='none'/></g><g transform='translate(37.5 37.5)'><path d='M0 -7 C2.5 -3.5 2.5 3.5 0 7 C-2.5 3.5 -2.5 -3.5 0 -7Z'/><path d='M-7 0 C-3.5 -2.5 3.5 -2.5 7 0 C3.5 2.5 -3.5 2.5 -7 0Z'/><circle r='1.6' fill='%232c4f9e' stroke='none'/></g><g transform='translate(100 11.5)'><path d='M0 -7 C2.5 -3.5 2.5 3.5 0 7 C-2.5 3.5 -2.5 -3.5 0 -7Z'/><path d='M-7 0 C-3.5 -2.5 3.5 -2.5 7 0 C3.5 2.5 -3.5 2.5 -7 0Z'/><circle r='1.6' fill='%232c4f9e' stroke='none'/></g><g transform='translate(162.5 37.5)'><path d='M0 -7 C2.5 -3.5 2.5 3.5 0 7 C-2.5 3.5 -2.5 -3.5 0 -7Z'/><path d='M-7 0 C-3.5 -2.5 3.5 -2.5 7 0 C3.5 2.5 -3.5 2.5 -7 0Z'/><circle r='1.6' fill='%232c4f9e' stroke='none'/></g></g></g></svg>");
  animation: ring-spin 85s linear infinite;
}

.ring-inner {
  transform: scale(0.68);
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='-6 -6 212 212'><g fill='none' stroke='%232c4f9e' stroke-width='1.6'><circle cx='100' cy='100' r='72' stroke-dasharray='45 15'/><circle cx='100' cy='100' r='62' stroke-dasharray='2 5'/><circle cx='100' cy='100' r='50' stroke-dasharray='8 20'/></g><g fill='%232c4f9e'><circle cx='135' cy='135' r='2.2'/><circle cx='65' cy='135' r='2.2'/><circle cx='65' cy='65' r='2.2'/><circle cx='135' cy='65' r='2.2'/></g></svg>");
  animation: ring-spin 55s linear infinite reverse;
}

@keyframes ring-spin {
  from { rotate: 0deg; }
  to { rotate: 360deg; }
}
</style>
