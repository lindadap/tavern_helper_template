<script setup lang="ts">
import { computed } from 'vue';
import type { Schema } from '../../../../schema';
import HeaderBar from '../HeaderBar.vue';
import EmotionCard from '../EmotionCard.vue';
import IdentityCard from '../IdentityCard.vue';
import PortraitStage from '../PortraitStage.vue';
import VoiceCard from '../VoiceCard.vue';
import SpecialButton from '../SpecialButton.vue';
import WeightMeter from './WeightMeter.vue';

const props = defineProps<{
  playerName: string;
  day: number;
  heroine?: Schema['吴恬恬'];
}>();

defineEmits<{ 'special-event': [] }>();

// 占位体重阈值 (kg) 与各阶段的「她眼中的自己」, 待世界书定稿后与 schema 同步
const STAGES = [
  { name: '纤细', max: 46, identity: '随时会折断的枯枝' },
  { name: '匀称', max: 58, identity: '开始发芽的病树' },
  { name: '丰满', max: 72, identity: '开了一树繁花' },
  { name: '超重', max: Infinity, identity: '被繁花压弯的枝头' },
] as const;

const wt = computed(() => props.heroine ?? { 体重: 45, 心声: '', 情绪: '平静' });

const stage = computed(() => STAGES.find(s => wt.value.体重 <= s.max)!);
const stage_name = computed(() => stage.value.name);
const identity = computed(() => stage.value.identity);

// 病树繁花: 体重越高, 飘落的花瓣越多 (0 ~ 26 瓣)
const petals = computed(() => {
  const count = Math.min(26, Math.max(0, Math.round((wt.value.体重 - 35) / 2)));
  return Array.from({ length: count }, (_, i) => ({
    left: (i * 37) % 100,
    delay: ((i * 0.83) % 9).toFixed(2),
    duration: (7 + (i % 5) * 1.3).toFixed(2),
    size: 9 + (i % 4) * 3,
    sway: (i % 2 ? 1 : -1) * (26 + (i % 5) * 9),
  }));
});

// 吴恬恬立绘 (待替换为真实图床链接)
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
</script>

<template>
  <section class="wt-root" :data-emotion="wt.情绪" :data-stage="stage_name">
    <div class="glow g1" aria-hidden="true"></div>
    <div class="glow g2" aria-hidden="true"></div>
    <div class="glow g3" aria-hidden="true"></div>
    <div class="dots" aria-hidden="true"></div>

    <!-- 落花: 数量随体重增长 -->
    <div class="petals" aria-hidden="true">
      <i
        v-for="(p, i) in petals"
        :key="i"
        class="petal"
        :style="{
          left: p.left + '%',
          width: p.size + 'px',
          height: p.size + 'px',
          '--d': p.duration + 's',
          '--dl': p.delay + 's',
          '--sw': p.sway + 'px',
        }"
      ></i>
    </div>

    <HeaderBar :player-name="playerName" :day="day" :stage="stage_name" />

    <main class="stack">
      <div class="portrait-zone">
        <span class="petal-halo" aria-hidden="true"></span>
        <PortraitStage :emotion="wt.情绪" :portraits="PORTRAITS" heroine-name="吴恬恬" />
      </div>

      <WeightMeter :value="wt.体重" :stage="stage_name" />

      <div class="info-row">
        <EmotionCard :emotion="wt.情绪" />
        <IdentityCard :identity="identity" :stage="stage_name" />
      </div>

      <VoiceCard :voice="wt.心声" />
    </main>

    <SpecialButton @trigger="$emit('special-event')" />
  </section>
</template>

<style scoped>
/* 病树繁花: 褐色基底, 暖调微光, 点点纹样, 花瓣随体重飘落 */
.wt-root {
  --c-text-primary: #f8efe7;
  --c-text-muted: rgba(248, 239, 231, 0.6);
  --c-surface: rgba(255, 244, 236, 0.07);
  --c-surface-strong: rgba(255, 244, 236, 0.12);
  --c-border-glass: rgba(255, 233, 216, 0.17);
  --c-accent: var(--c-accent-raw);
  --c-stage: var(--c-stage-raw);
  --shadow-tint: 10%;

  position: relative;
  overflow: hidden;
  max-width: 470px;
  margin-inline: auto;
  border-radius: 18px;
  border: 1px solid var(--c-border-glass);
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 219, 188, 0.07), transparent 70%),
    linear-gradient(165deg, #38261b 0%, #291a12 55%, #1f130c 100%);
  box-shadow:
    0 0 30px rgba(216, 141, 88, 0.14),
    0 14px 40px rgba(0, 0, 0, 0.5);
  padding: 16px 14px 14px;
}

/* 暖调微光团 */
.glow {
  position: absolute;
  width: 55%;
  height: 60%;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.3;
  pointer-events: none;
  mix-blend-mode: screen;
}
.glow.g1 { top: -22%; left: -12%; background: #c47a3c; animation: glow-drift-1 24s ease-in-out infinite alternate; }
.glow.g2 { bottom: -28%; right: -10%; background: #8f4d2e; animation: glow-drift-2 28s ease-in-out infinite alternate; }
.glow.g3 { top: 30%; left: 38%; width: 34%; height: 40%; background: #d98ba6; opacity: 0.2; animation: glow-drift-3 32s ease-in-out infinite alternate; }

/* 点点纹样 */
.dots {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgba(255, 226, 200, 0.055) 1px, transparent 1.6px);
  background-size: 13px 13px;
}

@keyframes glow-drift-1 { from { transform: translate(0, 0) scale(1); } to { transform: translate(24%, 16%) scale(1.15); } }
@keyframes glow-drift-2 { from { transform: translate(0, 0) scale(1.1); } to { transform: translate(-20%, -12%) scale(0.95); } }
@keyframes glow-drift-3 { from { transform: translate(-8%, 6%) scale(1); } to { transform: translate(12%, -10%) scale(1.2); } }

/* 飘落的花瓣 */
.petals { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.petal {
  position: absolute;
  top: -6%;
  border-radius: 100% 0 100% 0;
  background: linear-gradient(135deg, #ffd9e8, #ff9ec6 55%, #f27ab0);
  opacity: 0;
  animation: petal-fall var(--d) linear infinite;
  animation-delay: var(--dl);
}
@keyframes petal-fall {
  0%   { transform: translate3d(0, -30px, 0) rotate(0deg); opacity: 0; }
  8%   { opacity: 0.8; }
  85%  { opacity: 0.65; }
  100% { transform: translate3d(var(--sw), 820px, 0) rotate(320deg); opacity: 0; }
}

/* 立绘区柔光 */
.portrait-zone {
  --pws: min(82vw, 330px);
  --pwh: calc(var(--pws) * 1216 / 832);
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}
.petal-halo {
  position: absolute;
  top: calc(14px + var(--pwh) / 2);
  left: 50%;
  width: calc(var(--pws) * 1.2);
  aspect-ratio: 1;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: conic-gradient(
    from 20deg,
    transparent 0deg,
    color-mix(in srgb, var(--c-stage) 45%, transparent) 90deg,
    transparent 190deg,
    color-mix(in srgb, #f7a8c4 40%, transparent) 280deg,
    transparent 350deg
  );
  filter: blur(18px);
  opacity: 0.55;
  animation: halo-spin 14s linear infinite;
  pointer-events: none;
}
@keyframes halo-spin {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
</style>
