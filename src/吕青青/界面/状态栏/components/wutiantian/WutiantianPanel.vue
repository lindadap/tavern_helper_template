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
  /** 未登场锁定: 灰显不可交互, 无落花 */
  locked?: boolean;
  absent?: boolean;
  eventHint?: boolean;
}>();

defineEmits<{ 'special-event': [] }>();

// 体型只看已结算阶段。当天养分变化不改阶段, 过一天才结算。
const STAGES = [
  { name: '初始', identity: '还没开始被好好养活' },
  { name: '纤细', identity: '易碎的瓷器公主' },
  { name: '匀称', identity: '邻家少女的甜美' },
  { name: '丰满', identity: '丰腴的人妻诱惑' },
  { name: '超重', identity: '过剩的生命绽放' },
] as const;

const wt = computed(() => props.heroine ?? { 养分值: 20, 已结算阶段: '初始' as const, 心声: '', 情绪: '平静' });

const stage_name = computed(() => wt.value.已结算阶段);
const identity = computed(() => STAGES.find(s => s.name === stage_name.value)?.identity ?? '易碎的瓷器公主');

// 病树繁花配色仍跟当前养分走, 但体型标签不跟当天数字跳。
const pale = computed(() => Math.min(1, Math.max(0, (wt.value.养分值 - 40) / 50)));
const pink = computed(() => Math.min(1, Math.max(0, (wt.value.养分值 - 90) / 100)));

const petals = computed(() => {
  const count = Math.round((Math.min(200, Math.max(0, wt.value.养分值)) / 200) * 26);
  return Array.from({ length: count }, (_, i) => ({
    left: (i * 37) % 100,
    delay: ((i * 0.83) % 9).toFixed(2),
    duration: (7 + (i % 5) * 1.3).toFixed(2),
    size: 9 + (i % 4) * 3,
    sway: (i % 2 ? 1 : -1) * (26 + (i % 5) * 9),
  }));
});

const portrait_key = computed(() => {
  if (props.absent) return '';
  return `${stage_name.value}/${wt.value.情绪}`;
});

const PORTRAITS: Record<string, readonly string[]> = {
  '初始/害怕': ['https://i.meee.com.tw/hA1YzHh.png', 'https://i.meee.com.tw/5UFaDKe.png'],
  '初始/平静': ['https://i.meee.com.tw/iSJ20Ck.png'],
  '初始/开心': ['https://i.meee.com.tw/4r1AJWH.png'],
  '初始/委屈': ['https://i.meee.com.tw/SiQelLb.png', 'https://i.meee.com.tw/zlGdDe6.png', 'https://i.meee.com.tw/35uk7Ov.png'],
  '初始/被安抚': ['https://i.meee.com.tw/N7fG09O.png'],
  '初始/害羞': ['https://i.meee.com.tw/yGH0CDW.png'],
  '初始/心动': ['https://i.meee.com.tw/yLsZJQq.png', 'https://i.meee.com.tw/1oUwxu0.png', 'https://i.meee.com.tw/12QYE8E.png'],
  '纤细/平静': ['https://i.meee.com.tw/pHr5TD4.png', 'https://i.meee.com.tw/k2QP5iO.png', 'https://i.meee.com.tw/hNHuxke.png'],
  '纤细/开心': ['https://i.meee.com.tw/RqHUC84.png', 'https://i.meee.com.tw/ZKe4oua.png', 'https://i.meee.com.tw/B6HCYQn.png', 'https://i.meee.com.tw/tzTEAJN.png'],
  '纤细/委屈': ['https://i.meee.com.tw/YFalj2R.png', 'https://i.meee.com.tw/ggPM33f.png'],
  '纤细/害羞': ['https://i.meee.com.tw/PK5hiGI.png', 'https://i.meee.com.tw/Jg1XngM.png', 'https://i.meee.com.tw/uxaXk2H.png'],
  '纤细/发情': ['https://i.meee.com.tw/CnPU49i.png', 'https://i.meee.com.tw/F4TLW3Q.png'],
  '匀称/平静': ['https://i.meee.com.tw/ENXQz7v.png'],
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

    <!-- 落花: 数量随养分值增长 (未登场时不开放) -->
    <div v-if="!locked" class="petals" aria-hidden="true">
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

    <main class="stack" :class="{ 'stack-locked': locked, 'stack-absent': absent && !locked }">
      <div class="portrait-zone">
        <span class="petal-halo" aria-hidden="true"></span>
        <PortraitStage
          :emotion="wt.情绪"
          :portraits="PORTRAITS"
          :portrait-key="portrait_key"
          :seed="`吴恬恬-${day}-${portrait_key}`"
          heroine-name="吴恬恬"
        />
      </div>

      <NutritionMeter :value="wt.养分值" :stage="stage_name" />

      <div class="info-row">
        <EmotionCard :emotion="absent ? '—' : wt.情绪" />
        <IdentityCard :identity="identity" :stage="stage_name" />
      </div>

      <VoiceCard :voice="absent ? '' : wt.心声" />
    </main>

    <!-- 未登场提示 -->
    <section v-if="locked" class="card lock-banner">
      <span class="lock-icon">🔒</span>
      <p class="lock-text">她还没有来到这里。</p>
      <p class="lock-hint">先完成一次日常事件后，触发事件按钮会发光。再次确认，她才会来到这里。</p>
    </section>

    <SpecialButton :hint="eventHint" @trigger="$emit('special-event')" />
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

.stack-absent {
  filter: grayscale(0.92) brightness(0.72);
  opacity: 0.72;
}

/* 未登场锁定: 内容灰显且不可交互 */
.stack-locked {
  filter: grayscale(0.92) brightness(0.72) opacity(0.78);
  pointer-events: none;
}

.lock-banner {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}
.lock-icon { font-size: 26px; }
.lock-text {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--c-text-primary);
}
.lock-hint {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.7;
  color: var(--c-text-muted);
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
