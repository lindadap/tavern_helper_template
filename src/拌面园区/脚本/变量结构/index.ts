import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';
import { obedienceStageOf, Schema, stageOf, trustStageOf } from '../../schema';
import { clampShapingChange } from './limits';

async function start() {
  await waitGlobalInitialized('Mvu');
  registerMvuSchema(Schema);
  eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, (variables, previous) => {
    const stat = variables?.stat_data;
    const heroine = stat?.吕青青;
    const before = Number(previous?.stat_data?.吕青青?.塑形度);
    if (heroine && Number.isFinite(before) && Number.isFinite(Number(heroine.塑形度))) {
      heroine.塑形度 = clampShapingChange(before, Number(heroine.塑形度));
      heroine.$阶段 = stageOf(heroine.塑形度, heroine.爱恋确认 === true);
    }

    const roster = stat?.名册;
    if (roster && typeof roster === 'object') {
      for (const member of Object.values(roster as Record<string, Record<string, unknown>>)) {
        if (!member || typeof member !== 'object') continue;
        if (Number.isFinite(Number(member.服从度))) {
          member.服从度 = Math.max(0, Math.min(100, Math.round(Number(member.服从度))));
          member.$驯服阶段 = obedienceStageOf(Number(member.服从度));
        }
        if (Number.isFinite(Number(member.好感度))) {
          member.好感度 = Math.max(0, Math.min(100, Math.round(Number(member.好感度))));
          member.$信任阶段 = trustStageOf(Number(member.好感度));
        }
      }
    }
  });
  console.info('[拌面园区] 单角色变量结构已注册');
}

$(errorCatched(start));
