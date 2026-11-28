import {
  BATTLE_IDLE_SHUTOFF_TURNS,
  normalizeLocation,
  obedienceStageOf,
  pickLvqingqingLocation,
  pickNpcLocation,
  stageOf,
  TIME_SLOTS,
  trustStageOf,
  type TimeSlot,
} from '../../schema';

export function clampShapingChange(previous: number, proposed: number) {
  return Math.max(0, Math.min(300, Math.max(previous - 5, Math.min(previous + 7, proposed))));
}

export interface PostUpdateContext {
  lastAiMessage?: string;
  lastUserMessage?: string;
  rng?: () => number;
}

function asTimeSlot(raw: unknown): TimeSlot {
  return (TIME_SLOTS as readonly string[]).includes(String(raw)) ? (String(raw) as TimeSlot) : '上午';
}

export function hasCombatSignal(lastAiMessage = '', lastUserMessage = ''): boolean {
  return (
    lastAiMessage.includes('banmian-d20-panel') ||
    lastAiMessage.includes('D20 战术检定') ||
    lastAiMessage.includes('D20战术检定') ||
    lastUserMessage.includes('<ArenaBattleEvent') ||
    lastUserMessage.includes('【战斗开启】') ||
    lastUserMessage.includes('【斗兽场战斗中】')
  );
}

/**
 * Pure post-update hook executed after each MVU variable update:
 * 1. Enforces Lvqingqing shaping clamp [-5, +7] and recomputes stage.
 * 2. Clamps roster obedience/trust and recomputes derived stages.
 * 3. Runs 3-turn idle battle auto-shutoff fuse when D20 combat stops firing.
 * 4. Automatically rolls off-screen/new-day park locations at noon, dusk, or day change
 *    (keeping Lvqingqing able to enter 老板办公室/老板卧室, NPCs restricted to common areas,
 *    and newcomers in 调教室 untouched until explicitly moved out).
 */
export function applyPostUpdateRules(
  nextStat: Record<string, any> | undefined,
  prevStat: Record<string, any> | undefined,
  ctx: PostUpdateContext = {},
) {
  if (!nextStat || typeof nextStat !== 'object') return;
  const rng = ctx.rng ?? Math.random;

  // 1. Lvqingqing shaping clamp & stage derivation
  const heroine = nextStat.吕青青;
  const prevHeroine = prevStat?.吕青青;
  const beforeShaping = Number(prevHeroine?.塑形度);
  if (heroine && typeof heroine === 'object') {
    if (Number.isFinite(beforeShaping) && Number.isFinite(Number(heroine.塑形度))) {
      heroine.塑形度 = clampShapingChange(beforeShaping, Number(heroine.塑形度));
      heroine.$阶段 = stageOf(heroine.塑形度, heroine.爱恋确认 === true);
    }
    if (typeof heroine.位置 === 'string') {
      heroine.位置 = normalizeLocation(heroine.位置);
    }
  }

  // 2. Roster obedience/trust clamps & stage derivation
  const roster = nextStat.名册 as Record<string, Record<string, any>> | undefined;
  const prevRoster = (prevStat?.名册 as Record<string, Record<string, any>> | undefined) ?? {};
  if (roster && typeof roster === 'object') {
    for (const member of Object.values(roster)) {
      if (!member || typeof member !== 'object') continue;
      if (Number.isFinite(Number(member.服从度))) {
        member.服从度 = Math.max(0, Math.min(100, Math.round(Number(member.服从度))));
        member.$驯服阶段 = obedienceStageOf(Number(member.服从度));
      }
      if (Number.isFinite(Number(member.好感度))) {
        member.好感度 = Math.max(0, Math.min(100, Math.round(Number(member.好感度))));
        member.$信任阶段 = trustStageOf(Number(member.好感度));
      }
      if (typeof member.位置 === 'string') {
        member.位置 = normalizeLocation(member.位置);
      }
    }
  }

  // 3. System fields normalization & 3-turn idle battle auto-shutoff fuse
  const sys = nextStat.系统;
  const prevSys = prevStat?.系统;
  if (!sys || typeof sys !== 'object') return;

  if (typeof sys.玩家位置 === 'string') {
    sys.玩家位置 = normalizeLocation(sys.玩家位置);
  }
  const nextSlot = asTimeSlot(sys.时段);
  sys.时段 = nextSlot;
  const prevSlot = asTimeSlot(prevSys?.时段);

  const prevBattle = prevSys?.战斗中 === true;
  const nextBattle = sys.战斗中 === true;
  if (!nextBattle) {
    sys._战斗静止计数 = 0;
  } else {
    const freshlyStarted = !prevBattle && nextBattle;
    if (freshlyStarted || hasCombatSignal(ctx.lastAiMessage, ctx.lastUserMessage)) {
      sys._战斗静止计数 = 0;
    } else {
      const prevIdle = Number.isFinite(Number(prevSys?._战斗静止计数)) ? Number(prevSys._战斗静止计数) : 0;
      const nextIdle = prevIdle + 1;
      if (nextIdle >= BATTLE_IDLE_SHUTOFF_TURNS) {
        sys.战斗中 = false;
        sys._战斗静止计数 = 0;
      } else {
        sys._战斗静止计数 = nextIdle;
      }
    }
  }

  // 4. Automatic location scheduler on day advance or entering 中午 / 黄昏
  const prevDay = Number(prevSys?.天数);
  const nextDay = Number(sys.天数);
  const dayAdvanced = Number.isFinite(prevDay) && Number.isFinite(nextDay) && nextDay > prevDay;
  const enteredShiftSlot = prevSlot !== nextSlot && (nextSlot === '中午' || nextSlot === '黄昏');
  const isInBattle = sys.战斗中 === true;

  if (!isInBattle && (dayAdvanced || enteredShiftSlot)) {
    const playerLoc = typeof sys.玩家位置 === 'string' ? sys.玩家位置 : '';

    // Lvqingqing auto-schedule (respect explicit AI move in this turn, active 调教室 scene, or same-room active dialogue)
    if (heroine && typeof heroine === 'object') {
      const prevLqqLoc = typeof prevHeroine?.位置 === 'string' ? normalizeLocation(prevHeroine.位置) : undefined;
      const currLqqLoc = typeof heroine.位置 === 'string' ? normalizeLocation(heroine.位置) : '训练场/斗兽场';
      const aiMovedHeroine = prevLqqLoc !== undefined && prevLqqLoc !== currLqqLoc;
      const activelyWithPlayer = !dayAdvanced && heroine.在场 === true && currLqqLoc === playerLoc;
      const inTrainingRoom = !dayAdvanced && currLqqLoc === '调教室';

      if (!aiMovedHeroine && !activelyWithPlayer && !inTrainingRoom) {
        const stage = typeof heroine.$阶段 === 'string' ? heroine.$阶段 : stageOf(Number(heroine.塑形度) || 0, heroine.爱恋确认 === true);
        heroine.位置 = pickLvqingqingLocation(stage, nextSlot, rng);
      }
    }

    // Roster NPC auto-schedule (never auto-leaves 调教室; never enters 老板办公室/老板卧室)
    if (roster && typeof roster === 'object') {
      for (const [name, member] of Object.entries(roster)) {
        if (!member || typeof member !== 'object') continue;
        const currLoc = typeof member.位置 === 'string' ? normalizeLocation(member.位置) : '调教室';
        if (currLoc === '调教室') continue;

        const prevMember = prevRoster[name];
        const prevLoc = typeof prevMember?.位置 === 'string' ? normalizeLocation(prevMember.位置) : undefined;
        const aiMovedNpc = prevLoc === undefined || prevLoc !== currLoc;
        const activelyWithPlayer = !dayAdvanced && currLoc === playerLoc;

        if (!aiMovedNpc && !activelyWithPlayer) {
          member.位置 = pickNpcLocation(nextSlot, rng);
        }
      }
    }
  }
}
