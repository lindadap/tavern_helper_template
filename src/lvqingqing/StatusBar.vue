<template>
  <div class="lvqingqing-status-bar">
    <div class="status-header">
      <div class="char-name">吕青青</div>
      <div class="day-counter">第 {{ mvu.系统.天数 }} 天</div>
    </div>

    <div class="status-main">
      <div class="stage-indicator">
        <div class="stage-label">关系阶段</div>
        <div class="stage-value" :class="stageClass">
          {{ mvu.吕青青.$阶段 }}
        </div>
      </div>

      <div class="shaping-progress">
        <div class="progress-label">
          <span>塑形度</span>
          <span class="progress-value">{{ mvu.吕青青.塑形度 }} / 200</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" :style="progressStyle"></div>
          <div class="progress-segments">
            <div class="segment" :class="{ active: mvu.吕青青.塑形度 > 60 }"></div>
            <div class="segment" :class="{ active: mvu.吕青青.塑形度 > 120 }"></div>
          </div>
        </div>
        <div class="progress-marks">
          <span>顺从期</span>
          <span>暧昧期</span>
          <span>妻子期</span>
        </div>
      </div>

      <div class="emotion-display">
        <div class="emotion-label">当前情绪</div>
        <div class="emotion-value" :class="emotionClass">
          {{ emotionIcon }} {{ mvu.吕青青.情绪 }}
        </div>
      </div>

      <div class="identity-display">
        <div class="identity-label">她眼中的自己</div>
        <div class="identity-value">{{ mvu.吕青青.$身份认知 }}</div>
      </div>
    </div>

    <div class="inner-voice" v-if="mvu.吕青青.心声">
      <div class="voice-label">💭 内心独白</div>
      <div class="voice-content">{{ mvu.吕青青.心声 }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// 局部类型: 与 moyue/src/吕青青/schema.ts 的 z.output 保持一致 ($阶段/$身份认知为 transform 派生字段)
interface Schema {
  系统: { 天数: number; 当前主角: string };
  吕青青: {
    塑形度: number;
    心声: string;
    情绪: string;
    $阶段: string;
    $身份认知: string;
  };
  心情日志: Record<string, string>;
}

const props = defineProps<{
  mvu: Schema;
}>();

const progressStyle = computed(() => ({
  width: `${(props.mvu.吕青青.塑形度 / 200) * 100}%`,
}));

const stageClass = computed(() => {
  const stage = props.mvu.吕青青.$阶段;
  if (stage === '顺从期') return 'stage-obedient';
  if (stage === '暧昧期') return 'stage-ambiguous';
  if (stage === '妻子期') return 'stage-wife';
  return '';
});

const emotionClass = computed(() => {
  return `emotion-${props.mvu.吕青青.情绪}`;
});

const emotionIcon = computed(() => {
  const icons: Record<string, string> = {
    平静: '😐',
    开心: '😊',
    发情: '😳',
    生气: '😠',
    暴怒: '😡',
    伤心: '😢',
    无语: '😑',
    害羞: '😳',
  };
  return icons[props.mvu.吕青青.情绪] || '😐';
});
</script>

<style scoped>
.lvqingqing-status-bar {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.char-name {
  font-size: 20px;
  font-weight: 600;
  color: #a8dadc;
}

.day-counter {
  font-size: 14px;
  color: #8b95a0;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 12px;
  border-radius: 12px;
}

.status-main {
  display: grid;
  gap: 16px;
}

.stage-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 8px;
}

.stage-label {
  font-size: 14px;
  color: #8b95a0;
}

.stage-value {
  font-size: 16px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 6px;
}

.stage-obedient {
  background: rgba(168, 218, 220, 0.2);
  color: #a8dadc;
}

.stage-ambiguous {
  background: rgba(248, 196, 113, 0.2);
  color: #f8c471;
}

.stage-wife {
  background: rgba(240, 128, 128, 0.2);
  color: #f08080;
}

.shaping-progress {
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 8px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #8b95a0;
}

.progress-value {
  font-weight: 600;
  color: #e0e0e0;
}

.progress-bar-container {
  position: relative;
  height: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #a8dadc 0%, #f8c471 50%, #f08080 100%);
  border-radius: 10px;
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(168, 218, 220, 0.5);
}

.progress-segments {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  pointer-events: none;
}

.progress-segments .segment {
  flex: 1;
  border-right: 2px dashed rgba(255, 255, 255, 0.2);
}

.progress-segments .segment:last-child {
  border-right: none;
}

.progress-marks {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #6c757d;
  margin-top: 4px;
}

.emotion-display,
.identity-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 8px;
}

.emotion-label,
.identity-label {
  font-size: 14px;
  color: #8b95a0;
}

.emotion-value {
  font-size: 16px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 6px;
}

.emotion-平静 { background: rgba(139, 149, 160, 0.2); color: #8b95a0; }
.emotion-开心 { background: rgba(255, 215, 0, 0.2); color: #ffd700; }
.emotion-发情 { background: rgba(255, 105, 180, 0.2); color: #ff69b4; }
.emotion-生气 { background: rgba(255, 99, 71, 0.2); color: #ff6347; }
.emotion-暴怒 { background: rgba(220, 20, 60, 0.2); color: #dc143c; }
.emotion-伤心 { background: rgba(135, 206, 235, 0.2); color: #87ceeb; }
.emotion-无语 { background: rgba(112, 128, 144, 0.2); color: #708090; }
.emotion-害羞 { background: rgba(255, 182, 193, 0.2); color: #ffb6c1; }

.identity-value {
  font-size: 16px;
  font-weight: 600;
  color: #e0e0e0;
}

.inner-voice {
  margin-top: 16px;
  padding: 12px;
  background: rgba(168, 218, 220, 0.1);
  border-left: 3px solid #a8dadc;
  border-radius: 6px;
}

.voice-label {
  font-size: 12px;
  color: #a8dadc;
  margin-bottom: 6px;
  font-weight: 600;
}

.voice-content {
  font-size: 14px;
  color: #e0e0e0;
  line-height: 1.5;
  font-style: italic;
}
</style>
