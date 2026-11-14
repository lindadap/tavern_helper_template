import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';
import { Schema } from '../../schema';
async function start() {
  await waitGlobalInitialized('Mvu');
  registerMvuSchema(Schema);
  console.info('[拌面园区] 单角色变量结构已注册');
}
$(errorCatched(start));
