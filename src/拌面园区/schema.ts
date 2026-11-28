import { z } from 'zod';

export const EMOTIONS = ['平静', '开心', '发情', '生气', '暴怒', '委屈', '无语', '害羞'] as const;

export const TIME_SLOTS = ['上午', '中午', '黄昏', '夜晚'] as const;
export type TimeSlot = (typeof TIME_SLOTS)[number];

export const COMPANY_LOCATIONS = [
  '老板办公室',
  '老板卧室',
  '异种娘宿舍',
  '办公区',
  '餐厅',
  '医疗室',
  '训练场/斗兽场',
  '调教室',
] as const;

export type CompanyLocation = (typeof COMPANY_LOCATIONS)[number];

export const DEFAULT_LOCATION: CompanyLocation = '训练场/斗兽场';
export const LVQINGQING_COMBAT_POWER = 75;
export const ROSTER_SOFT_CAP = 8;
export const BATTLE_IDLE_SHUTOFF_TURNS = 3;

export type ScheduleBucket = '上午' | '中午' | '黄昏';

function toScheduleBucket(slot: TimeSlot): ScheduleBucket {
  if (slot === '中午') return '中午';
  if (slot === '黄昏') return '黄昏';
  return '上午';
}

// Lvqingqing can visit the boss's office and bedroom; she never auto-wanders into 调教室.
export const LVQINGQING_LOCATION_WEIGHTS = {
  early: {
    上午: {
      '训练场/斗兽场': 30,
      餐厅: 20,
      办公区: 20,
      异种娘宿舍: 15,
      老板办公室: 5,
      老板卧室: 5,
      医疗室: 5,
      调教室: 0,
    },
    中午: {
      餐厅: 35,
      '训练场/斗兽场': 25,
      办公区: 15,
      异种娘宿舍: 10,
      老板办公室: 5,
      老板卧室: 5,
      医疗室: 5,
      调教室: 0,
    },
    黄昏: {
      餐厅: 25,
      异种娘宿舍: 25,
      '训练场/斗兽场': 20,
      办公区: 15,
      老板办公室: 5,
      老板卧室: 5,
      医疗室: 5,
      调教室: 0,
    },
  },
  late: {
    上午: {
      老板卧室: 25,
      老板办公室: 20,
      办公区: 20,
      餐厅: 15,
      '训练场/斗兽场': 10,
      异种娘宿舍: 5,
      医疗室: 5,
      调教室: 0,
    },
    中午: {
      餐厅: 30,
      老板办公室: 20,
      老板卧室: 15,
      办公区: 15,
      '训练场/斗兽场': 10,
      异种娘宿舍: 5,
      医疗室: 5,
      调教室: 0,
    },
    黄昏: {
      老板卧室: 30,
      餐厅: 25,
      老板办公室: 15,
      办公区: 15,
      '训练场/斗兽场': 5,
      异种娘宿舍: 5,
      医疗室: 5,
      调教室: 0,
    },
  },
} as const satisfies Record<'early' | 'late', Record<ScheduleBucket, Record<CompanyLocation, number>>>;

// Common park heteromorph NPCs NEVER auto-enter 老板办公室, 老板卧室, or 调教室.
export const NPC_LOCATION_WEIGHTS = {
  上午: {
    '训练场/斗兽场': 25,
    办公区: 25,
    异种娘宿舍: 25,
    餐厅: 20,
    医疗室: 5,
    老板办公室: 0,
    老板卧室: 0,
    调教室: 0,
  },
  中午: {
    餐厅: 40,
    办公区: 25,
    异种娘宿舍: 15,
    '训练场/斗兽场': 15,
    医疗室: 5,
    老板办公室: 0,
    老板卧室: 0,
    调教室: 0,
  },
  黄昏: {
    异种娘宿舍: 30,
    餐厅: 30,
    '训练场/斗兽场': 20,
    办公区: 15,
    医疗室: 5,
    老板办公室: 0,
    老板卧室: 0,
    调教室: 0,
  },
} as const satisfies Record<ScheduleBucket, Record<CompanyLocation, number>>;

export function isCompanyLocation(value: string): value is CompanyLocation {
  return (COMPANY_LOCATIONS as readonly string[]).includes(value);
}

export function normalizeLocation(raw: string): CompanyLocation {
  const trimmed = raw.trim();
  if (!trimmed) return DEFAULT_LOCATION;
  if (isCompanyLocation(trimmed)) return trimmed;

  if (trimmed.includes('调教室') || trimmed.includes('训诫室') || trimmed.includes('小黑屋')) return '调教室';
  if (trimmed.includes('办公区') || trimmed === '大厅' || trimmed.includes('客厅') || trimmed.includes('公共办公')) {
    return '办公区';
  }
  if (trimmed.includes('办公室') || trimmed.includes('3F') || trimmed.includes('3f') || trimmed.includes('三楼')) {
    return '老板办公室';
  }
  if (trimmed.includes('卧室') || trimmed.includes('主卧')) return '老板卧室';
  if (trimmed.includes('宿舍')) return '异种娘宿舍';
  if (trimmed.includes('餐厅') || trimmed.includes('食堂') || trimmed.includes('厨房')) return '餐厅';
  if (trimmed.includes('医疗室') || trimmed.includes('医务室') || trimmed.includes('治疗室')) return '医疗室';
  if (trimmed.includes('训练场') || trimmed.includes('斗兽场') || trimmed.includes('B1') || trimmed.includes('b1')) {
    return '训练场/斗兽场';
  }

  return '办公区';
}

function pickFromWeights(
  weights: Record<CompanyLocation, number>,
  rng: () => number = Math.random,
  fallback: CompanyLocation = DEFAULT_LOCATION,
): CompanyLocation {
  const entries = Object.entries(weights) as [CompanyLocation, number][];
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  if (total <= 0) return fallback;
  let cursor = rng() * total;
  for (const [location, weight] of entries) {
    if (weight <= 0) continue;
    cursor -= weight;
    if (cursor <= 0) return location;
  }
  return fallback;
}

export function pickLvqingqingLocation(
  stage: string,
  slot: TimeSlot = '上午',
  rng: () => number = Math.random,
): CompanyLocation {
  const phase = stage === '恋爱期' || stage === '妻子期' ? 'late' : 'early';
  const bucket = toScheduleBucket(slot);
  return pickFromWeights(LVQINGQING_LOCATION_WEIGHTS[phase][bucket], rng, DEFAULT_LOCATION);
}

export function pickNpcLocation(
  slot: TimeSlot = '上午',
  rng: () => number = Math.random,
): CompanyLocation {
  const bucket = toScheduleBucket(slot);
  return pickFromWeights(NPC_LOCATION_WEIGHTS[bucket], rng, '异种娘宿舍');
}

export function stageOf(value: number, confirmed = false) {
  return value < 90 ? '宠物期' : value < 180 ? '暧昧期' : value < 270 || !confirmed ? '恋爱期' : '妻子期';
}

export function obedienceStageOf(value: number) {
  return value < 30 ? '野性戒备' : value < 60 ? '勉强低头' : value < 90 ? '温顺听话' : '彻底驯服';
}

export function trustStageOf(value: number) {
  return value < 30 ? '疏离戒心' : value < 60 ? '微有好感' : value < 90 ? '亲近依恋' : '深爱黏人';
}

const locationField = z.string().transform(normalizeLocation).prefault(DEFAULT_LOCATION);
const trainingRoomField = z.string().transform(normalizeLocation).prefault('调教室');

export const RosterMemberSchema = z.object({
  种族: z.string().trim().min(1).prefault('猫娘'),
  性格: z.string().trim().prefault('傲娇'),
  外貌: z.string().trim().prefault('匀称可爱'),
  印象颜色: z.string().trim().prefault('暖橘橙'),
  服装风格: z.string().trim().prefault('宽松居家针织风'),
  简介: z.string().trim().prefault('刚入园的新异种娘，还在警惕地打量四周。'),
  位置: trainingRoomField,
  好感度: z.coerce.number().transform(v => Math.max(0, Math.min(100, Math.round(v)))).prefault(10),
  服从度: z.coerce.number().transform(v => Math.max(0, Math.min(100, Math.round(v)))).prefault(15),
  _战力: z.coerce.number().transform(v => Math.max(10, Math.min(100, Math.round(v)))).prefault(40),
}).prefault({}).transform(member => ({
  ...member,
  $驯服阶段: obedienceStageOf(member.服从度),
  $信任阶段: trustStageOf(member.好感度),
}));

export type RosterMember = z.output<typeof RosterMemberSchema>;

export const Schema = z.object({
  系统: z.object({
    天数: z.coerce.number().int().min(1).prefault(1),
    时段: z.enum(TIME_SLOTS).prefault('上午'),
    玩家位置: locationField,
    战斗中: z.boolean().prefault(false),
    _战斗静止计数: z.coerce.number().int().min(0).prefault(0),
  }).prefault({}),
  吕青青: z.object({
    塑形度: z.coerce.number().transform(v => Math.max(0, Math.min(300, v))).prefault(20),
    爱恋确认: z.boolean().prefault(false),
    情绪: z.enum(EMOTIONS).prefault('委屈'),
    在场: z.boolean().prefault(true),
    位置: locationField,
    _战力: z.coerce.number().transform(v => Math.max(10, Math.min(100, Math.round(v)))).prefault(LVQINGQING_COMBAT_POWER),
    心声: z.string().trim().refine(s => !/\s/u.test(s) && Array.from(s).length >= 10 && Array.from(s).length <= 30, '心声必须为10至30个字符，不能包含空白').prefault('青青再也不想被丢出去了,能留在这里吗?'),
  }).prefault({}).transform(data => ({ ...data, $阶段: stageOf(data.塑形度, data.爱恋确认) })),
  名册: z.record(z.string().trim().min(1), RosterMemberSchema).prefault({}),
}).prefault({});

export type Schema = z.output<typeof Schema>;
