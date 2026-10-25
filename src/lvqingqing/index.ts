import { createApp } from 'vue';
// 内置副本, 源组件: C:\Users\lindap\Desktop\Silly\moyue\src\吕青青\界面\StatusBar.vue (改动后需重新拷贝)
import StatusBar from './StatusBar.vue';

const FALLBACK = {
  系统: { 天数: 1, 当前主角: '你' },
  吕青青: {
    塑形度: 0,
    心声: '',
    情绪: '平静',
    $阶段: '顺从期',
    $身份认知: '宠物兼打手',
  },
  心情日志: {} as Record<string, string>,
};

// 酒馆正则会把 mvublock 内的变量 JSON 拼接到本页 URL 的 # 之后
function readMvuFromFragment(): any {
  const raw = decodeURIComponent(location.hash.slice(1)).trim();
  if (!raw) return undefined;
  const json_text = raw.replace(/^```[\w-]*\s*/i, '').replace(/```\s*$/, '');
  try {
    const parsed = JSON.parse(json_text);
    return typeof parsed?.stat_data === 'object' ? parsed.stat_data : parsed;
  } catch (error) {
    console.warn('fragment 中的 MVU 数据解析失败, 使用默认值', error);
    return undefined;
  }
}

// 与 moyue schema.ts 的 transform 一致: 由塑形度派生阶段字段
function deriveStage(塑形度: number) {
  if (塑形度 <= 60) return { $阶段: '顺从期', $身份认知: '宠物兼打手' };
  if (塑形度 <= 120) return { $阶段: '暧昧期', $身份认知: '想要被选择的少女' };
  return { $阶段: '妻子期', $身份认知: '妻子' };
}

const provided = readMvuFromFragment();
const 塑形度 = Number(provided?.吕青青?.塑形度) || 0;
const mvu = {
  ...FALLBACK,
  ...provided,
  系统: { ...FALLBACK.系统, ...provided?.系统 },
  吕青青: { ...FALLBACK.吕青青, ...provided?.吕青青, ...deriveStage(塑形度) },
  心情日志: { ...FALLBACK.心情日志, ...provided?.心情日志 },
};

console.info('lvqingqing status bar mounted, mvu =', mvu);

createApp(StatusBar, { mvu }).mount('#app');
