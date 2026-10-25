<script setup lang="ts">
import { computed } from 'vue';
import type { Schema } from '../../../../schema';
import HeaderBar from '../HeaderBar.vue';
import EmotionCard from '../EmotionCard.vue';
import IdentityCard from '../IdentityCard.vue';
import PortraitStage from '../PortraitStage.vue';
import VoiceCard from '../VoiceCard.vue';
import SpecialButton from '../SpecialButton.vue';
import NutritionMeter from './NutritionMeter.vue';

const props = defineProps<{
  playerName: string;
  day: number;
  heroine?: Schema['吴恬恬'];
}>();

defineEmits<{ 'special-event': [] }>();

// 养分值阶段 (与 吴恬恬_养分系统 世界书一致): 0-100, 初始 20
// identity 直接采用世界书各阶段的「核心定位」文案
const STAGES = [
  { name: '纤细', max: 40, identity: '易碎的瓷器公主' },
  { name: '匀称', max: 60, identity: '邻家少女的甜美' },
  { name: '丰满', max: 80, identity: '丰腴的人妻诱惑' },
  { name: '超重', max: Infinity, identity: '过剩的生命绽放' },
] as const;

const wt = computed(() => props.heroine ?? { 养分值: 20, 心声: '', 情绪: '平静' });

const stage = computed(() => STAGES.find(s => wt.value.养分值 <= s.max)!);
const stage_name = computed(() => stage.value.name);
const identity = computed(() => stage.value.identity);

// 病树繁花配色: 纤细=褐色; 匀称起转为淡粉白; 养分越高越接近粉色
const pale = computed(() => Math.min(1, Math.max(0, (wt.value.养分值 - 40) / 12)));
const pink = computed(() => Math.min(1, Math.max(0, (wt.value.养分值 - 50) / 50)));

// 病树繁花: 养分值越高, 飘落的花瓣越多 (0 ~ 26 瓣)
const petals = computed(() => {
  const count = Math.round((Math.min(100, Math.max(0, wt.value.养分值)) / 100) * 26);
  return Array.from({ length: count }, (_, i) => ({
    left: (i * 37) % 100,
    delay: ((i * 0.83) % 9).toFixed(2),
    duration: (7 + (i % 5) * 1.3).toFixed(2),
    size: 9 + (i % 4) * 3,
    sway: (i % 2 ? 1 : -1) * (26 + (i % 5) * 9),
  }));
});

// 吴恬恬立绘: 按阶段选择 (匀称/超重暂借相邻阶段图, 待补图后替换)
const PORTRAITS: Record<string, string> = {
  纤细: 'https://i.meee.com.tw/YPl6Eg9.png',
  匀称: 'https://i.meee.com.tw/YPl6Eg9.png', // TODO: 待替换为匀称阶段立绘
  丰满: 'https://i.meee.com.tw/dgnlSf6.png',
  超重: 'https://i.meee.com.tw/dgnlSf6.png', // TODO: 待替换为超重阶段立绘
};
</script>

<template>
  <section
    class="wt-root"
    :data-emotion="wt.情绪"
    :data-stage="stage_name"
    :style="{ '--pale': String(pale), '--pink': String(pink) }"
  >
    <div class="glow g1" aria-hidden="true"></div>
    <div class="glow g2" aria-hidden="true"></div>
    <div class="glow g3" aria-hidden="true"></div>
    <div class="dots" aria-hidden="true"></div>

    <!-- 落花: 数量随养分值增长 -->
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
        <PortraitStage
          :emotion="wt.情绪"
          :portraits="PORTRAITS"
          :portrait-key="stage_name"
          heroine-name="吴恬恬"
        />
      </div>

      <NutritionMeter :value="wt.养分值" :stage="stage_name" />

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
/* 病树繁花: 褐色基底 → (纤细结束后) 淡粉白为主 → 养分越高越粉 */
.wt-root {
  --palep: calc(var(--pale, 0) * 100%);
  --pinkp: calc(var(--pink, 0) * 100%);
  /* 卡片/文字随 pale 陡峭切换 (约养分 45-47 间), 早于背景完成粉白化, 避免中段对比度塌陷 */
  --cardw: clamp(0, calc((var(--pale, 0) - 0.44) / 0.12), 1);
  --cardp: calc(var(--cardw) * 100%);
  --c-text-primary: color-mix(in srgb, color-mix(in srgb, #f8efe7, #6d4753 var(--cardp)), #8f3d5f var(--pinkp));
  --c-text-muted: color-mix(in srgb, color-mix(in srgb, rgba(248, 239, 231, 0.6), rgba(122, 88, 100, 0.6) var(--cardp)), rgba(150, 78, 108, 0.65) var(--pinkp));
  --c-surface: color-mix(in srgb, color-mix(in srgb, rgba(30, 20, 14, 0.72), rgba(255, 255, 255, 0.86) var(--cardp)), rgba(255, 238, 244, 0.8) var(--pinkp));
  --c-surface-strong: color-mix(in srgb, color-mix(in srgb, rgba(36, 24, 16, 0.82), rgba(255, 255, 255, 0.93) var(--cardp)), rgba(255, 236, 243, 0.95) var(--pinkp));
  --c-border-glass: color-mix(in srgb, color-mix(in srgb, rgba(255, 233, 216, 0.17), rgba(214, 140, 168, 0.5) var(--cardp)), rgba(219, 112, 150, 0.55) var(--pinkp));
  --c-bar-track: color-mix(in srgb, color-mix(in srgb, rgba(0, 0, 0, 0.35), rgba(190, 120, 150, 0.25) var(--cardp)), rgba(205, 130, 165, 0.25) var(--pinkp));
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
    linear-gradient(165deg,
      color-mix(in srgb, color-mix(in srgb, #38261b, #fbf2f5 var(--palep)), #f8d8e3 var(--pinkp)) 0%,
      color-mix(in srgb, color-mix(in srgb, #291a12, #f7e9ee calc(var(--palep) * 0.95)), #f3c6d8 var(--pinkp)) 55%,
      color-mix(in srgb, color-mix(in srgb, #1f130c, #f0dfe6 var(--palep)), #eeb9ce var(--pinkp)) 100%);
  box-shadow:
    0 0 30px color-mix(in srgb, rgba(216, 141, 88, 0.14), rgba(238, 127, 180, 0.22) var(--pinkp)),
    0 14px 40px rgba(0, 0, 0, 0.5);
  padding: 16px 14px 14px;
}

/* 暖调微光团: 随淡粉化而减弱 */
.glow {
  position: absolute;
  width: 55%;
  height: 60%;
  border-radius: 50%;
  filter: blur(70px);
  opacity: calc(0.3 - var(--pale, 0) * 0.16);
  pointer-events: none;
  mix-blend-mode: screen;
}
.glow.g1 { top: -22%; left: -12%; background: #c47a3c; animation: glow-drift-1 24s ease-in-out infinite alternate; }
.glow.g2 { bottom: -28%; right: -10%; background: #8f4d2e; animation: glow-drift-2 28s ease-in-out infinite alternate; }
.glow.g3 { top: 30%; left: 38%; width: 34%; height: 40%; background: #d98ba6; opacity: calc(0.2 + var(--pink, 0) * 0.12); animation: glow-drift-3 32s ease-in-out infinite alternate; }

/* 点点纹样 */
.dots {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(color-mix(in srgb, rgba(255, 226, 200, 0.055), rgba(219, 112, 150, 0.07) var(--pinkp)) 1px, transparent 1.6px);
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
