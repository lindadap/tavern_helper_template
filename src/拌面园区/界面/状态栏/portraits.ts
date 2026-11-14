import type { EMOTIONS } from '../../schema';
// 每种情绪只使用自己的立绘；待作者提供其余图片。
export const PORTRAITS: Record<(typeof EMOTIONS)[number], string> = {
  平静: 'https://i.meee.com.tw/n4rMVzn.png',
  开心: '', 发情: '', 生气: '', 暴怒: '', 伤心: '', 无语: '', 害羞: '',
};
