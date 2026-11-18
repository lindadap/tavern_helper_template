import { z } from 'zod';
export const EMOTIONS = ['平静', '开心', '发情', '生气', '暴怒', '委屈', '无语', '害羞'] as const;
export function stageOf(value: number, confirmed = false) {
  return value < 90 ? '宠物期' : value < 180 ? '暧昧期' : value < 270 || !confirmed ? '恋爱期' : '妻子期';
}
export const Schema = z.object({
  系统: z.object({ 天数: z.coerce.number().int().min(1).prefault(1) }).prefault({}),
  吕青青: z.object({
    塑形度: z.coerce.number().transform(v => Math.max(0, Math.min(300, v))).prefault(20),
    爱恋确认: z.boolean().prefault(false),
    情绪: z.enum(EMOTIONS).prefault('委屈'),
    心声: z.string().trim().refine(s => !/\s/u.test(s) && Array.from(s).length >= 10 && Array.from(s).length <= 30, '心声必须为10至30个字符，不能包含空白').prefault('青青再也不想被丢出去了,能留在这里吗?'),
  }).prefault({}).transform(data => ({ ...data, $阶段: stageOf(data.塑形度, data.爱恋确认) })),
}).prefault({});
export type Schema = z.output<typeof Schema>;
