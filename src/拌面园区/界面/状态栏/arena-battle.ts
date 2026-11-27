import { LVQINGQING_COMBAT_POWER, ROSTER_SOFT_CAP, type Schema } from '../../schema';
import {
  formatHeteromorphPromptBrief,
  rollHeteromorphSpec,
  type RolledHeteromorph,
} from '../../heteromorph-pool';

export interface ArenaOpponentPreview {
  spec: RolledHeteromorph;
  summaryLine: string;
}

export function stageBonusOf(stage: Schema['吕青青']['$阶段']): { stageIndex: number; bonus: number } {
  switch (stage) {
    case '宠物期':
      return { stageIndex: 1, bonus: 1 };
    case '暧昧期':
      return { stageIndex: 2, bonus: 2 };
    case '恋爱期':
      return { stageIndex: 3, bonus: 3 };
    case '妻子期':
      return { stageIndex: 4, bonus: 4 };
  }
}

export function powerDiffModifier(allyPower: number, enemyPower: number): number {
  return Math.trunc((allyPower - enemyPower) / 5);
}

export function createOpponentPreview(rng: () => number = Math.random): ArenaOpponentPreview {
  const spec = rollHeteromorphSpec(rng);
  const summaryLine = `${spec.species}（${spec.breedHint}） · ${spec.personalities.join(' / ')} · ${spec.height} / ${spec.build} / ${spec.looks}`;
  return { spec, summaryLine };
}

function sanitizeAttrValue(raw: string): string {
  return raw
    .replace(/[\r\n"<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 48);
}

export function buildArenaBattlePrompt(
  fighterInput: string,
  data: Schema,
  opponent: RolledHeteromorph,
): string {
  const trimmedInput = fighterInput.trim() || '吕青青';
  const safeFighterAttr = sanitizeAttrValue(trimmedInput) || '吕青青';
  const stageInfo = stageBonusOf(data.吕青青.$阶段);

  const lqqPower = data.吕青青._战力 ?? LVQINGQING_COMBAT_POWER;
  const lqqMentioned =
    trimmedInput.includes('吕青青') || trimmedInput.includes('青青') || trimmedInput.includes('吕布');

  const allyLines: string[] = [];
  if (lqqMentioned) {
    const diff = powerDiffModifier(lqqPower, opponent.combatPower);
    const diffText = diff >= 0 ? `+${diff}` : `${diff}`;
    allyLines.push(
      `- 吕青青（核心主角）：隐藏战力 ${lqqPower} vs 对手 ${opponent.combatPower} → 战力差加值 ${diffText}；当前为第${stageInfo.stageIndex}阶段「${data.吕青青.$阶段}」→ 阶段加值 +${stageInfo.bonus}（综合固定修正 ${diff + stageInfo.bonus >= 0 ? `+${diff + stageInfo.bonus}` : `${diff + stageInfo.bonus}`}）。`,
    );
  }

  for (const [name, member] of Object.entries(data.名册)) {
    if (trimmedInput.includes(name)) {
      const diff = powerDiffModifier(member._战力, opponent.combatPower);
      const diffText = diff >= 0 ? `+${diff}` : `${diff}`;
      allyLines.push(
        `- ${name}（在园${member.种族}，${member.$驯服阶段}/${member.$信任阶段}）：隐藏战力 ${member._战力} vs 对手 ${opponent.combatPower} → 战力差加值 ${diffText}。`,
      );
    }
  }

  if (allyLines.length === 0) {
    // Player typed a custom instruction (e.g. solo boss or custom wording); provide Lvqingqing as standby reference.
    const diff = powerDiffModifier(lqqPower, opponent.combatPower);
    const diffText = diff >= 0 ? `+${diff}` : `${diff}`;
    allyLines.push(
      `- 玩家自由安排：「${trimmedInput}」（若安排吕青青压阵参考：隐藏战力 ${lqqPower} vs 对手 ${opponent.combatPower} → 战力差 ${diffText}，第${stageInfo.stageIndex}阶段「${data.吕青青.$阶段}」→ 阶段加值 +${stageInfo.bonus}）。`,
    );
  }

  const rosterCount = Object.keys(data.名册).length;
  const rosterCapNote =
    rosterCount >= ROSTER_SOFT_CAP
      ? `注意：当前在园名册已满 ${ROSTER_SOFT_CAP} 人，打服后暂由安保区收容等待{{user}}归档空位，本回合先不写入 /名册。`
      : `当前在园名册 ${rosterCount}/${ROSTER_SOFT_CAP} 人；打服收编后可按指引写入 /名册/<新名字>。`;

  return [
    `<ArenaBattleEvent fighter="${safeFighterAttr}">`,
    `【斗兽场战斗中】{{user}}来到地下一层「训练场/斗兽场」观战台，安排本场驯服/对练战斗。`,
    `玩家指定的出战安排：${trimmedInput}`,
    '',
    '【己方后台战力与加值核对（严禁在正文直接念出隐藏数字）】',
    ...allyLines,
    '',
    formatHeteromorphPromptBrief(opponent),
    `- 本次对手隐藏_战力为 ${opponent.combatPower}（${opponent.sizeTier === 'large' ? '大型哺乳种' : '小型哺乳种'}，严禁在正文里说出具体数字）。`,
    `- ${rosterCapNote}`,
    '',
    '【演出与系统要求】',
    '1. 立刻启用 <地下斗兽场_D20战斗系统> 规则：写出新异种娘被押入地下斗兽场、与己方展开首轮交锋的紧张画面，并按公式附上精美的 D20 战术检定 HTML 面板（逐项标明原始骰面、战力差加值与原因、阶段加值与原因、考验难度 DC 与判定结果）。',
    '2. 请自然穿插观战台系统语音或控制台微光的含蓄暗示（提示 {{user}} 拥有观战台环境调控与战术干预权限，但不要把具体手段全部剧透），并在本回合结尾留出空间让 {{user}} 决定是否暗中做手脚、补给防护或指挥下一回合。',
    '3. 请将「系统.玩家位置」与实际参战角色的「位置」同步更新为「训练场/斗兽场」（若吕青青参战则「吕青青.在场」为 true）。',
    '</ArenaBattleEvent>',
  ].join('\n');
}

export async function requestArenaBattle(
  source: 'tavern' | 'preview',
  fighterInput: string,
  data: Schema,
  opponent: RolledHeteromorph,
): Promise<string> {
  const prompt = buildArenaBattlePrompt(fighterInput, data, opponent);
  if (source === 'preview') {
    return `预览模式已生成战斗指令（出战：${fighterInput.trim() || '吕青青'}，对手：${opponent.species}）`;
  }

  await createChatMessages([{ role: 'user', message: prompt, is_hidden: false }], {
    insert_before: 'end',
    refresh: 'affected',
  });
  await triggerSlash('/trigger');
  return '';
}
