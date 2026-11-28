import { LVQINGQING_COMBAT_POWER, ROSTER_SOFT_CAP, Schema } from '../../schema';
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

export function buildArenaBattlePrompt(
  playerActionInput: string,
  data: Schema,
  opponent: RolledHeteromorph,
): string {
  const userAction = playerActionInput.trim() || '我走上地下斗兽场观战台，示意开始本场对练。';
  const stageInfo = stageBonusOf(data.吕青青.$阶段);

  const lqqPower = data.吕青青._战力 ?? LVQINGQING_COMBAT_POWER;
  const lqqMentioned =
    userAction.includes('吕青青') || userAction.includes('青青') || userAction.includes('吕布');

  const allyLines: string[] = [];
  if (lqqMentioned) {
    const diff = powerDiffModifier(lqqPower, opponent.combatPower);
    const diffText = diff >= 0 ? `+${diff}` : `${diff}`;
    allyLines.push(
      `- 吕青青（核心主角）：隐藏战力 ${lqqPower} vs 对手 ${opponent.combatPower} → 战力差加值 ${diffText}；当前为第${stageInfo.stageIndex}阶段「${data.吕青青.$阶段}」→ 阶段加值 +${stageInfo.bonus}（综合固定修正 ${diff + stageInfo.bonus >= 0 ? `+${diff + stageInfo.bonus}` : `${diff + stageInfo.bonus}`}）。`,
    );
  }

  for (const [name, member] of Object.entries(data.名册)) {
    if (userAction.includes(name)) {
      const diff = powerDiffModifier(member._战力, opponent.combatPower);
      const diffText = diff >= 0 ? `+${diff}` : `${diff}`;
      allyLines.push(
        `- ${name}（在园${member.种族}，${member.$驯服阶段}/${member.$信任阶段}）：隐藏战力 ${member._战力} vs 对手 ${opponent.combatPower} → 战力差加值 ${diffText}。`,
      );
    }
  }

  if (allyLines.length === 0) {
    const diff = powerDiffModifier(lqqPower, opponent.combatPower);
    const diffText = diff >= 0 ? `+${diff}` : `${diff}`;
    allyLines.push(
      `- 若安排吕青青出战参考：隐藏战力 ${lqqPower} vs 对手 ${opponent.combatPower} → 战力差加值 ${diffText}；当前为第${stageInfo.stageIndex}阶段「${data.吕青青.$阶段}」→ 阶段加值 +${stageInfo.bonus}。`,
    );
    for (const [name, member] of Object.entries(data.名册)) {
      const mDiff = powerDiffModifier(member._战力, opponent.combatPower);
      const mDiffText = mDiff >= 0 ? `+${mDiff}` : `${mDiff}`;
      allyLines.push(
        `- 若安排${name}（${member.种族}）出战参考：隐藏战力 ${member._战力} vs 对手 ${opponent.combatPower} → 战力差加值 ${mDiffText}。`,
      );
    }
  }

  const rosterCount = Object.keys(data.名册).length;
  const rosterCapNote =
    rosterCount >= ROSTER_SOFT_CAP
      ? `注意：当前在园名册已满 ${ROSTER_SOFT_CAP} 人，战后先由安保押送至B1「调教室」隔离待命，等{{user}}归档空位后再写入 /名册。`
      : `当前在园名册 ${rosterCount}/${ROSTER_SOFT_CAP} 人；本场战斗结束后（无论输赢），新异种娘均会先押入B1「调教室」，请按指引写入 /名册/<新名字> 且位置填「调教室」，待后续真正收服后再迁入「异种娘宿舍」。`;

  // Player's own dialogue and actions remain visible OUTSIDE <ArenaBattleEvent>,
  // while the system directive block inside <ArenaBattleEvent> is masked by ST display regex.
  const hiddenSystemBlock = [
    '<ArenaBattleEvent>',
    '【战斗开启】【斗兽场战斗中】{{user}}已在地下一层「训练场/斗兽场」开启驯服/对练战斗，请严格承接上方{{user}}亲手写下的赛前行动、对猫娘说的话与出战安排展开剧情。',
    '',
    '【己方后台战力与加值核对（严禁在正文直接念出隐藏数字）】',
    ...allyLines,
    '',
    formatHeteromorphPromptBrief(opponent),
    `- 本次对手隐藏_战力为 ${opponent.combatPower}（${opponent.sizeTier === 'large' ? '大型哺乳种' : '小型哺乳种'}，严禁在正文里说出具体数字）。`,
    `- ${rosterCapNote}`,
    '',
    '【演出与系统要求】',
    '1. 本回合已立刻启用 <地下斗兽场_D20战斗系统>：先写出己方听到{{user}}赛前话语/小动作后的生动反应与新异种娘被押入斗兽场展开交锋的画面，并按公式附上精美的 D20 战术检定 HTML 面板（逐项标明原始骰面、战力差加值与原因、阶段加值与原因、情境/干预修正、考验难度 DC 与判定结果）。',
    '2. 若{{user}}在上方已采取赛前下药、准备防护装备或打气许诺等行动，必须在正文与 DC/加值中立刻体现；同时自然穿插观战台系统语音或控制台微光的含蓄暗示，留出空间让{{user}}决定是否暗中做手脚或继续指挥。',
    '3. 变量更新要求：若本回合战斗尚未结束，保持 `/系统/战斗中` 为 `true`；若本回合已经分出胜负，立刻将 `/系统/战斗中` 设为 `false`，并无论输赢都将新异种娘送入 B1「调教室」（`/名册/<新名字>/位置` 为 `"调教室"`）。同步将「系统.玩家位置」与实际参战角色的「位置」更新为「训练场/斗兽场」（若吕青青参战则「吕青青.在场」为 true）。',
    '</ArenaBattleEvent>',
  ].join('\n');

  return `${userAction}\n\n${hiddenSystemBlock}`;
}

export async function requestArenaBattle(
  source: 'tavern' | 'preview',
  playerActionInput: string,
  data: Schema,
  opponent: RolledHeteromorph,
): Promise<string> {
  const prompt = buildArenaBattlePrompt(playerActionInput, data, opponent);
  if (source === 'preview') {
    return `预览模式已生成战斗指令（对手：${opponent.species}）`;
  }

  // Flip stat_data.系统.战斗中 = true on the latest message before triggering AI as double insurance alongside <ArenaBattleEvent>.
  if (typeof getCurrentMessageId === 'function' && typeof updateVariablesWith === 'function') {
    const messageId = getCurrentMessageId();
    const nextData = Schema.parse({
      ...data,
      系统: { ...data.系统, 战斗中: true, _战斗静止计数: 0 },
    });
    await updateVariablesWith(
      vars => {
        vars.stat_data = nextData;
        return vars;
      },
      { type: 'message', message_id: messageId },
    );
  }

  await createChatMessages([{ role: 'user', message: prompt, is_hidden: false }], {
    insert_before: 'end',
    refresh: 'affected',
  });
  await triggerSlash('/trigger');
  return '';
}
