export type MammalSizeTier = 'small' | 'large';

export interface SpeciesSpec {
  name: string;
  weight: number;
  sizeTier: MammalSizeTier;
  subBreeds: readonly string[];
}

export interface ImpressionColorSpec {
  name: string;
  hex: string;
}

export interface RolledHeteromorph {
  species: string;
  breedHint: string;
  sizeTier: MammalSizeTier;
  combatPower: number;
  personalities: string[];
  height: string;
  build: string;
  bust: string;
  looks: string;
  impressionColor: string;
  impressionColorHex: string;
  clothingStyle: string;
}

// Catgirls carry 0.60 weight; 10 other mammal species evenly split the remaining 0.40 (0.04 each).
export const SPECIES_POOL: readonly SpeciesSpec[] = [
  {
    name: '猫娘',
    weight: 0.6,
    sizeTier: 'small',
    subBreeds: ['三花猫', '布偶猫', '橘猫', '暹罗猫', '折耳猫', '奶牛猫', '狸花猫', '白猫', '黑猫', '缅因猫'],
  },
  { name: '兔娘', weight: 0.04, sizeTier: 'small', subBreeds: ['垂耳兔', '雪白短毛兔', '道奇斑点兔'] },
  { name: '狐娘', weight: 0.04, sizeTier: 'small', subBreeds: ['赤狐', '雪狐', '银狐'] },
  { name: '犬娘', weight: 0.04, sizeTier: 'small', subBreeds: ['柴犬', '柯基', '牧羊犬', '萨摩耶'] },
  { name: '松鼠娘', weight: 0.04, sizeTier: 'small', subBreeds: ['红松鼠', '花栗鼠'] },
  { name: '浣熊娘', weight: 0.04, sizeTier: 'small', subBreeds: ['小浣熊', '干脆面灰浣熊'] },
  { name: '水獭娘', weight: 0.04, sizeTier: 'small', subBreeds: ['海獭', '小爪水獭'] },
  { name: '虎娘', weight: 0.04, sizeTier: 'large', subBreeds: ['东北虎', '白虎', '孟加拉虎'] },
  { name: '狼娘', weight: 0.04, sizeTier: 'large', subBreeds: ['北极银狼', '灰狼', '黑狼'] },
  { name: '马娘', weight: 0.04, sizeTier: 'large', subBreeds: ['栗色骏马', '纯白温血马', '乌骓黑马'] },
  { name: '熊娘', weight: 0.04, sizeTier: 'large', subBreeds: ['棕熊', '北极白熊', '小黑熊'] },
] as const;

export const PERSONALITY_POOL = [
  '傲娇',
  '开朗',
  '傲慢',
  '高冷',
  '阴沉',
  '懦弱',
  '天然呆',
  '沉重',
  '贪玩',
  '调皮',
  '心机',
  '护食',
  '黏人',
  '好胜',
  '嘴硬心软',
  '容易受惊',
] as const;

export type PersonalityTrait = (typeof PERSONALITY_POOL)[number];

// Symmetric mutual-exclusion map so multi-trait rolls remain coherent and charming.
export const PERSONALITY_CONFLICTS: Partial<Record<PersonalityTrait, readonly PersonalityTrait[]>> = {
  开朗: ['阴沉', '高冷', '沉重'],
  阴沉: ['开朗', '调皮', '贪玩'],
  高冷: ['开朗', '黏人', '调皮', '贪玩'],
  傲慢: ['懦弱', '容易受惊'],
  懦弱: ['傲慢', '好胜'],
  天然呆: ['心机'],
  心机: ['天然呆', '懦弱'],
  沉重: ['开朗', '贪玩'],
  调皮: ['阴沉', '高冷'],
  贪玩: ['阴沉', '高冷', '沉重'],
  黏人: ['高冷'],
  好胜: ['懦弱'],
  容易受惊: ['傲慢'],
};

export const HEIGHT_POOL = ['高挑', '正常', '矮小'] as const;
export const BUILD_POOL = ['微胖有肉感', '匀称可爱', '纤细苗条'] as const;
export const BUST_POOL = ['A罩杯', 'B罩杯', 'C罩杯', 'D罩杯', 'E罩杯'] as const;

export const LOOKS_POOL = [
  '清秀帅气系',
  '清纯系',
  '美艳系',
  '娇软可爱系',
  '清冷美丽系',
  '阴沉美人系',
  '人妻感系',
  '元气甜妹系',
  '慵懒御姐系',
  '病娇楚楚系',
  '野性飒爽系',
] as const;

export const IMPRESSION_COLOR_POOL: readonly ImpressionColorSpec[] = [
  { name: '琥珀金', hex: '#d99b38' },
  { name: '浅樱粉', hex: '#e58ca8' },
  { name: '雾霾蓝', hex: '#6d94c5' },
  { name: '奶杏白', hex: '#d8c3a5' },
  { name: '薄荷绿', hex: '#52b79c' },
  { name: '酒暗红', hex: '#b84a5e' },
  { name: '薰衣草紫', hex: '#9b7ed9' },
  { name: '焦糖棕', hex: '#b5764c' },
  { name: '松石青', hex: '#3ca3a3' },
  { name: '月光银', hex: '#9aa8bd' },
  { name: '暖橘橙', hex: '#e08448' },
  { name: '炭墨黑', hex: '#5a6578' },
] as const;

export const CLOTHING_STYLE_POOL = [
  '宽松居家针织风',
  '利落运动背心短裤风',
  '软萌百褶学院风',
  '慵懒睡衣开衫风',
  '飒爽工装机能风',
  '清纯连衣裙风',
  '轻熟修身御姐风',
  '俏皮卫衣短裙风',
] as const;

function pickOne<T>(list: readonly T[], rng: () => number): T {
  const idx = Math.min(list.length - 1, Math.floor(rng() * list.length));
  return list[idx];
}

function rollInt(min: number, max: number, rng: () => number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function pickWeightedSpecies(rng: () => number = Math.random): SpeciesSpec {
  const total = SPECIES_POOL.reduce((sum, item) => sum + item.weight, 0);
  let cursor = rng() * total;
  for (const spec of SPECIES_POOL) {
    cursor -= spec.weight;
    if (cursor <= 0) return spec;
  }
  return SPECIES_POOL[0];
}

export function pickCompatiblePersonalities(count: 2 | 3 = 2, rng: () => number = Math.random): PersonalityTrait[] {
  const picked: PersonalityTrait[] = [];
  const pool = [...PERSONALITY_POOL];

  while (picked.length < count && pool.length > 0) {
    const idx = Math.floor(rng() * pool.length);
    const candidate = pool.splice(idx, 1)[0];
    const conflicts = PERSONALITY_CONFLICTS[candidate] ?? [];
    const hasConflict = picked.some(existing => {
      const existingConflicts = PERSONALITY_CONFLICTS[existing] ?? [];
      return conflicts.includes(existing) || existingConflicts.includes(candidate);
    });
    if (!hasConflict) {
      picked.push(candidate);
    }
  }
  return picked;
}

export function rollHeteromorphSpec(rng: () => number = Math.random): RolledHeteromorph {
  const speciesSpec = pickWeightedSpecies(rng);
  const breedHint = pickOne(speciesSpec.subBreeds, rng);
  const combatPower =
    speciesSpec.sizeTier === 'large' ? rollInt(50, 80, rng) : rollInt(30, 50, rng);
  const traitCount: 2 | 3 = rng() < 0.45 ? 3 : 2;
  const personalities = pickCompatiblePersonalities(traitCount, rng);
  const color = pickOne(IMPRESSION_COLOR_POOL, rng);

  return {
    species: speciesSpec.name,
    breedHint,
    sizeTier: speciesSpec.sizeTier,
    combatPower,
    personalities,
    height: pickOne(HEIGHT_POOL, rng),
    build: pickOne(BUILD_POOL, rng),
    bust: pickOne(BUST_POOL, rng),
    looks: pickOne(LOOKS_POOL, rng),
    impressionColor: color.name,
    impressionColorHex: color.hex,
    clothingStyle: pickOne(CLOTHING_STYLE_POOL, rng),
  };
}

export function resolveImpressionColorHex(colorName: string): string {
  const text = colorName.trim();
  const exact = IMPRESSION_COLOR_POOL.find(c => c.name === text);
  if (exact) return exact.hex;
  if (text.includes('红') || text.includes('绯') || text.includes('玫')) return '#c95a6f';
  if (text.includes('粉') || text.includes('樱') || text.includes('桃')) return '#e58ca8';
  if (text.includes('金') || text.includes('黄') || text.includes('柠')) return '#d99b38';
  if (text.includes('橘') || text.includes('橙')) return '#e08448';
  if (text.includes('绿') || text.includes('翠') || text.includes('薄荷')) return '#52b79c';
  if (text.includes('青') || text.includes('碧')) return '#3ca3a3';
  if (text.includes('蓝') || text.includes('靛') || text.includes('海')) return '#6d94c5';
  if (text.includes('紫') || text.includes('薰')) return '#9b7ed9';
  if (text.includes('棕') || text.includes('咖') || text.includes('茶')) return '#b5764c';
  if (text.includes('白') || text.includes('奶') || text.includes('米')) return '#d8c3a5';
  if (text.includes('银') || text.includes('灰')) return '#9aa8bd';
  if (text.includes('黑') || text.includes('墨')) return '#5a6578';
  return '#6d94c5';
}

export function formatHeteromorphPromptBrief(spec: RolledHeteromorph): string {
  const appearanceSummary = `${spec.breedHint}特征，${spec.height}身高、${spec.build}、${spec.bust}、${spec.looks}`;
  return [
    `【新异种娘抽选骨架（请基于此塑造有新鲜感、鲜活立体的角色）】`,
    `- 种族：${spec.species}（细分特征参考：${spec.breedHint}）`,
    `- 性格组合：${spec.personalities.join(' / ')}`,
    `- 体型与长相：${spec.height} · ${spec.build} · ${spec.bust} · ${spec.looks}`,
    `- 印象颜色：${spec.impressionColor}；常穿服装风格：${spec.clothingStyle}`,
    `- 命名硬规则：请为她取一个有记忆点的可爱名字——若为三字名，后两字必须叠字（如苏柚柚、白糯糯、林团团）；若为两字名，必须软糯可爱带宠物感（如奶糖、团子、布丁、豆包）。不得与已有角色重名。`,
    `- 入册变量指引：若本回合结束时她留在了园区，请通过 JSONPatch 在 /名册/<新名字> 插入条目，字段包含：种族("${spec.species}")、性格("${spec.personalities.join('、')}")、外貌("${appearanceSummary}")、印象颜色("${spec.impressionColor}")、服装风格("${spec.clothingStyle}")、简介(15~40字鲜活初印象)、位置(实际所在房间)、好感度(初见10~20)、服从度(初见10~25)、_战力(${spec.combatPower}，隐藏战力严禁在正文中直接念出具体数字)。`,
  ].join('\n');
}
