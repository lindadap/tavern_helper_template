import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';
import { Schema, stageOf } from '../../schema';
import { clampShapingChange } from './limits';
async function start() {
  await waitGlobalInitialized('Mvu');
  registerMvuSchema(Schema);
  eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, (variables, previous) => {
    const before = Number(previous?.stat_data?.吕青青?.塑形度);
    const heroine = variables?.stat_data?.吕青青;
    if (!heroine || !Number.isFinite(before) || !Number.isFinite(Number(heroine.塑形度))) return;
    heroine.塑形度 = clampShapingChange(before, Number(heroine.塑形度));
    heroine.$阶段 = stageOf(heroine.塑形度, heroine.爱恋确认 === true);
  });
  console.info('[拌面园区] 单角色变量结构已注册');
}
$(errorCatched(start));
