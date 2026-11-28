import {
  pickLvqingqingLocation,
  pickNpcLocation,
  ROSTER_SOFT_CAP,
  type CompanyLocation,
  type RosterMember,
  type TimeSlot,
} from '../../schema';
import { formatHeteromorphPromptBrief, rollHeteromorphSpec, type RolledHeteromorph } from '../../heteromorph-pool';

export type HeroineStage = '宠物期' | '暧昧期' | '恋爱期' | '妻子期';

export interface AdvanceContext {
  day: number;
  shaping: number;
  stage: HeroineStage;
  rosterCount?: number;
  roster?: Record<string, RosterMember>;
}

export interface AdvanceHistory {
  exclusiveTriggered: Record<string, boolean>;
  recentCommonIds: string[];
}

export interface CommonEvent {
  id: string;
  category: '关系变好' | '关系变差' | '现代物品惊奇' | '猫娘闯祸' | '温馨日常' | '新人入园';
  title: string;
  outline: string;
}

// Exclusive event weight when the current phase slot is still available (50%).
export const EXCLUSIVE_WEIGHT = 0.5;
const RECENT_COMMON_WINDOW = 6;

// Common event pool shared across advances (all grounded inside the park).
export const COMMON_EVENT_POOL: CommonEvent[] = [
  // --- 1. 异种娘之间关系变好（主角不参与过程，末尾登场看结果） ---
  {
    id: 'bond_sunbath_pile',
    category: '关系变好',
    title: '猫娘叠在一起晒太阳',
    outline:
      '【视角要求】先聚焦园区1F办公区阳光落地窗前的猫娘们，{{user}}暂不介入，直到故事末尾推门回来才撞见结果。' +
      '午后阳光斜斜铺在地毯上，暖洋洋得让人犯困。原本各占山头、平时还有点互相戒备的猫娘们不知不觉往最暖和的那块阳光里挪，' +
      '先是一只小猫娘迷迷糊糊靠过来，连平日里冷着脸的吕青青也没把人推开，最后几只猫娘竟毛茸茸地叠成一团晒太阳，耳朵贴着耳朵、尾巴松松搭在一起发出轻轻呼噜声。' +
      '{{user}}办完事推门回来时正好撞见这副超可爱的“猫猫叠叠乐”，吕青青惊醒后还嘴硬不承认刚才靠得很舒服。',
  },
  {
    id: 'bond_snack_truce',
    category: '关系变好',
    title: '半包小鱼干的休战协议',
    outline:
      '【视角要求】先写园区餐厅里吕青青与另一只平时有点怕她的猫娘（或园区其他异种娘）之间的互动，{{user}}暂不介入。' +
      '起因是那只猫娘在厨房够不到高处的零食罐，吕青青路过时冷着脸顺手替她拿下来，对方受宠若惊分了她半包鱼干。' +
      '两只猫居然靠在窗台边安静地一块儿啃完了，气氛莫名融洽起来。{{user}}在故事末尾路过时，正好看见平日里一见面就炸毛的两只猫难得挨着晒太阳的结果。',
  },
  {
    id: 'bond_grooming_nap',
    category: '关系变好',
    title: '午后大厅的意外合群',
    outline:
      '【视角要求】全程先聚焦园区1F办公区休息处的异种娘们，{{user}}在末尾才推门回来看到结果。' +
      '午后空调检修短暂停了一会儿，几只异种娘热得无精打采，吕青青嘴上嫌吵却默默把最凉快的瓷砖地和风扇位让出一半，还顺手帮旁边打瞌睡的小猫娘挡住刺眼阳光。' +
      '等{{user}}办完事回来时，看见原本各占山头的几只猫娘竟凑成一团打盹，关系明显热络了许多。',
  },

  // --- 2. 异种娘之间关系变差 / 吵架（需要 {{user}} 出面协调） ---
  {
    id: 'conflict_territory',
    category: '关系变差',
    title: '沙发黄金位的领地风波',
    outline:
      '园区里一只新来的/好胜的猫娘趁吕青青不在，霸占了1F办公区离{{user}}常坐位置最近的抱枕并留了气味。' +
      '吕青青回来后当场压平耳朵、尾巴炸开，双方互相哈气对峙、火药味十足，眼看就要动手把休息区掀翻。' +
      '其余猫娘不敢劝架，局面僵持不下，结尾留出明确口子等待{{user}}出面协调偏心或定规矩。',
  },
  {
    id: 'conflict_laundry',
    category: '关系变差',
    title: '外套上的陌生猫毛',
    outline:
      '有只猫娘不小心把{{user}}搭在椅背上的外套碰掉，手忙脚乱拍灰时蹭了一身别的猫毛，恰好被路过的吕青青撞见。' +
      '吕青青误以为对方故意抢主人的气味，冷脸质问把对方吓得委屈炸毛，两只猫闹得不可开交、互不理睬，连晚饭都分开吃。' +
      '需要{{user}}弄清误会并出面安抚调停。',
  },

  // --- 3. 面对现代物品产生的惊奇/困惑 ---
  {
    id: 'modern_robot_vacuum',
    category: '现代物品惊奇',
    title: '会自己跑的圆盘怪物',
    outline:
      '园区新添了一台扫地机器人，启动后嗡嗡转着圈满地跑。吕青青和几只猫娘如临大敌，把这台会自己避障的圆盘当成入侵领地的铁壳精怪，' +
      '排成一排蹲在沙发上紧盯它的走位，吕青青甚至做好了随时冲上去一肘拍扁它的架势。' +
      '描写她们对现代家电一本正经的离谱猜测与猫科本能反应，{{user}}在末尾登场收拾残局或科普。',
  },
  {
    id: 'modern_vending_machine',
    category: '现代物品惊奇',
    title: '自动售货机的奇迹',
    outline:
      '园区1F休息走廊新装了一台冷饮自动售货机。{{user}}带着吕青青试用这台“拍下卡就会咚一声吐出冰饮料的铁箱子”——' +
      '按键亮灯、机械臂挪动、罐子滚落出来的声响每一步都让她冰蓝的眼睛微微发亮，甚至一本正经怀疑铁箱里面是不是蹲着只负责递东西的小精怪，还差点对机器点点头道谢。' +
      '轻松温馨的小品，写出她面对现代造物时的反差萌与{{user}}的自然互动。',
  },
  {
    id: 'modern_first_message',
    category: '现代物品惊奇',
    title: '第一条手机消息',
    outline:
      '{{user}}给吕青青配了手机并教她用聊天软件。当晚她躲在房间里对着输入框纠结了半天，手指戳屏幕又重又笨拙，删了又写、错字连篇还乱点了个离谱表情包，' +
      '终于鼓起勇气给{{user}}发出了人生第一条消息。写出消息原文、{{user}}看到手机震动后的反应，以及她躲在门后竖着猫耳偷听动静的可爱模样。',
  },
  {
    id: 'modern_supply_unboxing',
    category: '现代物品惊奇',
    title: '补给车的大采购开箱',
    outline:
      '园区每周一次的无人补给车送来几大箱生活与生鲜采购物资，摆满了1F餐厅长桌。琳琅满目的冷冻鲜鱼、果冻甜品和零食罐对吕青青来说全是新大陆——' +
      '她盯着生鲜箱挪不动步、尾巴不受控地轻轻甩动，还偷偷往自己怀里多塞了两包小鱼干。' +
      '写出{{user}}的纵容互动，以及她把长长的物资清单当成战利品收进口袋的小细节。',
  },
  {
    id: 'modern_phone_video',
    category: '现代物品惊奇',
    title: '方块里传来的猫叫声',
    outline:
      '办公区平板或手机不小心外放了一段猫咪叫声的短视频。几只猫娘围着发光的薄玻璃板团团转，甚至绕到屏幕背面找“藏在里面的猫”，' +
      '吕青青冷着脸戳了戳屏幕，发现摸不到毛又气又困惑，怀疑人类发明了什么装魂法器。' +
      '自然写出猫娘们被现代科技唬住的反差萌，留给{{user}}结尾互动。',
  },
  {
    id: 'modern_microwave',
    category: '现代物品惊奇',
    title: '叮一声变热的魔法铁箱',
    outline:
      '一只猫娘在餐厅看着冷饭放进微波炉转几圈、“叮”一声就冒出热气，惊奇得眼睛发亮，拉着吕青青凑在玻璃门前研究里面的盘子为什么自己转。' +
      '她们正嘀咕能不能把冻硬的小鱼干或者湿毛巾也塞进去“施法”，差点把带锡纸的包装一起放进去，正好被刚进餐厅的{{user}}撞见。',
  },

  // --- 4. 猫娘闯祸（打碎东西/手忙脚乱善后） ---
  {
    id: 'trouble_broken_mug',
    category: '猫娘闯祸',
    title: '碎掉的青花茶杯',
    outline:
      '一只猫娘（或吕青青追逗猫棒/伸懒腰没收住力气）不小心把桌上{{user}}常用的茶杯扫到地上摔得粉碎。' +
      '闯祸后猫耳啪地压成飞机耳，生怕挨骂或被讨厌，手忙脚乱想把瓷片藏起来又笨手笨脚差点划到手，旁边别的猫娘帮忙打掩护反而越帮越忙。' +
      '等{{user}}听到动静走过来时，现场一片欲盖弥彰的尴尬，等待{{user}}处理。',
  },
  {
    id: 'trouble_spilled_noodles',
    category: '猫娘闯祸',
    title: '失手打翻的拌面酱罐',
    outline:
      '猫娘们嘴馋提前溜进餐厅偷看晚饭准备的拌面酱，结果爪子一滑把酱料罐碰翻，浓郁的酱汁泼了一桌还沾到了猫爪和裙角上。' +
      '为了销毁证据，闯祸的猫娘一边偷舔爪子上的酱一边拿抹布越擦越花，彻底暴露了作案现场。{{user}}推门而入时正撞上这副惨状。',
  },

  // --- 5. 温馨日常 ---
  {
    id: 'daily_night_guard',
    category: '温馨日常',
    title: '深夜门口的守望',
    outline:
      '凌晨{{user}}在2F老板卧室起夜推开门，发现吕青青正抱膝靠在房门口的地板上打盹，猫耳却还警觉地立着——不知道守了多久。' +
      '被发现后她嘴硬找借口（“顺手路过”“门口地板凉快”），死活不承认是放心不下主人，等着{{user}}戳破她的小心思并把她拎回屋里。',
  },
  {
    id: 'daily_rain_umbrella',
    category: '温馨日常',
    title: '园区雨廊共伞',
    outline:
      '园区突降暴雨，{{user}}和吕青青穿过露天中庭往主楼走，手里只有一把伞，两个人挤在伞下并肩前行。' +
      '写出猫娘讨厌淋雨的细节（耳朵沾到水珠抖一抖、轻轻甩水、怕淋湿悄悄往{{user}}身边挤、手指攥住衣角），结尾回到暖和的室内擦头发喝热饮。',
  },

  // --- 6. 新异种娘押送入园（调用通用哺乳动物抽卡池） ---
  {
    id: 'intake_new_heteromorph',
    category: '新人入园',
    title: '政府押送新异种娘入园',
    outline:
      '政府武装押送队突然送来一名新移交的危险/难驯异种娘，五花大绑带进了园区大厅或地下训练场交接。' +
      '请先写出交接时的紧张与反差气氛，让这位新异种娘鲜活亮相，并在结尾留出空间让{{user}}决定是立刻派人上斗兽场按服还是直接送进B1调教室观察。',
  },
];

// Exclusive event for Lvqingqing: reporter interview ear-petting contrast.
function buildLvqingqingReporterOutline(stage: HeroineStage): string {
  const commonLead =
    '【角色专属事件：记者回访采访】一位年轻随和的地方/融媒体记者慕名来园区采访，' +
    '听说曾经凶名在外、抓伤过前主人的黑猫娘吕青青如今在{{user}}照料下变得安稳乖巧，亲眼见到后惊叹不已，真心称赞{{user}}有本事。' +
    '聊到兴起时，记者像现实中见到超级可爱的猫咪一样，非常自然地微笑着伸手想轻轻摸一下吕青青的猫耳。' +
    '【硬性基调】全程自然、生活化、无任何情色暗示，重点写出记者单纯被猫娘真实反应狠狠萌到/震撼到的生动细节。\n';

  if (stage === '宠物期') {
    return (
      commonLead +
      '【当前阶段反应（低塑形度·宠物期：给摸）】吕青青怕闯祸给{{user}}惹麻烦，木着一张冷冰冰的冰蓝眼武将脸站着不动，任由记者轻轻摸了摸头和耳朵；' +
      '她的耳朵绝不主动竖起，反而微微压平忍耐，但毛茸茸的手感和“外表凶巴巴却超乖任撸”的反差把记者萌得心都要化了，忍不住连连夸赞她好乖。' +
      '记者一收手转身记录笔记，青青立刻委屈巴巴蹭回{{user}}身边，急切地把刚才被碰过的那侧耳朵往{{user}}掌心里塞，小声讨摸要把外人的味道盖掉。'
    );
  }
  if (stage === '暧昧期') {
    return (
      commonLead +
      '【当前阶段反应（低塑形度·暧昧期：勉强给摸）】记者伸手轻抚她猫耳时，青青还没学会直接翻脸，但浑身绷得像块硬木头，' +
      '一边下意识微微往后缩，一边拿湿漉漉的冰蓝眼睛可怜巴巴地往{{user}}那边偷瞄求助；' +
      '记者被她这副“虽然忍着给摸但满眼都在找主人”的大号粘人猫反应萌得不行，笑叹她眼里真的只有{{user}}。' +
      '一脱身，青青就飞快跑回{{user}}面前把口袋里的小零食塞过来，低头拿脑袋顶上{{user}}掌心，要{{user}}用力摸回来把外人味道全擦掉。'
    );
  }
  if (stage === '恋爱期') {
    return (
      commonLead +
      '【当前阶段反应（高塑形度·恋爱期：绝不给摸）】与从前截然不同，记者的手刚伸过来，吕青青连半秒都不忍，干脆利落地后退半步、猫耳压平，指尖冷冷弹出一截寒光，' +
      '护主又护食地冷声拒绝，明确表示自己的耳朵和身子只属于{{user}}一个人，外人别碰。' +
      '记者被这股武将气场吓得一愣，可下一秒就看见青青转头凑回{{user}}身边，冰蓝眼眸瞬间软下来、主动把黑猫耳塞进{{user}}手心底下蹭着讨摸，' +
      '强烈的双标对比让记者又惊又叹，彻底体会到这只凶猛猫娘如今只认{{user}}一个人的专属感，给{{user}}带来满满的成就与优越感。'
    );
  }
  return (
    commonLead +
    '【当前阶段反应（高塑形度·妻子期：绝不给摸）】记者自然伸手想摸耳时，吕青青连眼神都懒得给外人，从容而干脆地侧身避开，' +
    '语气平静却不容置疑地亮明身份——自己是有老公的人，除了{{user}}谁也别想碰她一根头发。' +
    '说完她当着记者的面自然挽住{{user}}的胳膊，把猫耳贴着{{user}}肩膀亲昵蹭了蹭、尾巴悄悄卷住{{user}}手指，宣示主权的同时又软糯得像只只对老公撒娇的大猫。' +
    '记者先是被冷面猫老大的威压镇住，随即又被她对{{user}}的极致双标甜到说不出话，对{{user}}佩服得五体投地，让{{user}}切实感受到“我的猫娘彻底只属于我一人”的满足与优越感。'
  );
}

export function pickAdvanceEvent(
  ctx: AdvanceContext,
  history: AdvanceHistory,
  rng: () => number = Math.random,
) {
  const nextDay = ctx.day + 5;
  const nextSlot: TimeSlot = rng() < 0.5 ? '中午' : '黄昏';
  const rosterObj = ctx.roster ?? {};
  const rosterCount = ctx.rosterCount ?? Object.keys(rosterObj).length;
  const isEarly = ctx.shaping < 180;
  const slotKey = isEarly ? 'lqq_reporter_early' : 'lqq_reporter_late';
  const canTriggerExclusive = !history.exclusiveTriggered[slotKey];

  const nextHistory: AdvanceHistory = {
    exclusiveTriggered: { ...history.exclusiveTriggered },
    recentCommonIds: [...history.recentCommonIds],
  };

  let eventId = '';
  let eventTitle = '';
  let eventType = '';
  let eventOutline = '';
  let isExclusive = false;
  let rolledNewcomer: RolledHeteromorph | undefined;

  if (canTriggerExclusive && rng() < EXCLUSIVE_WEIGHT) {
    isExclusive = true;
    eventId = slotKey;
    nextHistory.exclusiveTriggered[slotKey] = true;
    eventTitle = isEarly ? '记者回访采访（前期）' : '记者回访采访（后期）';
    eventType = '吕青青专属事件';
    eventOutline = buildLvqingqingReporterOutline(ctx.stage);
  } else {
    const canIntake = rosterCount < ROSTER_SOFT_CAP;
    const eligible = canIntake
      ? COMMON_EVENT_POOL
      : COMMON_EVENT_POOL.filter(e => e.id !== 'intake_new_heteromorph');
    const candidates = eligible.filter(e => !history.recentCommonIds.includes(e.id));
    const pool = candidates.length > 0 ? candidates : eligible;
    const picked = pool[Math.floor(rng() * pool.length)];

    eventId = picked.id;
    nextHistory.recentCommonIds = [...nextHistory.recentCommonIds, picked.id].slice(-RECENT_COMMON_WINDOW);
    eventTitle = picked.title;
    eventType = `公共事件·${picked.category}`;
    eventOutline = picked.outline;

    if (picked.id === 'intake_new_heteromorph') {
      rolledNewcomer = rollHeteromorphSpec(rng);
      eventOutline = `${picked.outline}\n${formatHeteromorphPromptBrief(rolledNewcomer)}`;
    }
  }

  const rolledLocation: CompanyLocation = pickLvqingqingLocation(ctx.stage, nextSlot, rng);
  const rolledNpcLocations: Record<string, CompanyLocation> = {};
  const npcMoveNotes: string[] = [];
  for (const [name, member] of Object.entries(rosterObj)) {
    if (member.位置 === '调教室') {
      rolledNpcLocations[name] = '调教室';
      npcMoveNotes.push(`${name}仍在「调教室」（待调教）`);
    } else {
      const nextNpcLoc = pickNpcLocation(nextSlot, rng);
      rolledNpcLocations[name] = nextNpcLoc;
      npcMoveNotes.push(`${name}→「${nextNpcLoc}」`);
    }
  }
  const npcScheduleSummary =
    npcMoveNotes.length > 0 ? `；园区其他名册异种娘动向参考：${npcMoveNotes.join('、')}` : '';

  const prompt = [
    '<TimeAdvanceEvent>',
    `[时间推进] 距上次互动已过去5天，当前时间来到第${nextDay}天·${nextSlot}（请务必将变量「系统.天数」更新为${nextDay}、「系统.时段」更新为「${nextSlot}」）。`,
    `请先用2-3句话自然过渡这5天的园区日常，再严格围绕以下随机事件大纲展开剧情：`,
    `【${eventType}｜${eventTitle}】`,
    eventOutline,
    `【园区动向刷新】经过这5天，吕青青本轮按阶段日常倾向自然活动于「${rolledLocation}」${npcScheduleSummary}（若上方事件本身明确发生在其他具体地点，以事件实际落点为准）；请务必在本回合变量更新中，按正文结束时的实际场景同步更新「吕青青.位置」、「吕青青.在场」、「系统.玩家位置」及对应名册成员位置。`,
    `要求：紧扣人物当前阶段人设（吕青青当前为${ctx.stage}，塑形度${ctx.shaping}），结尾自然留出给{{user}}介入或回应的空间。`,
    '</TimeAdvanceEvent>',
  ].join('\n');

  return {
    prompt,
    nextHistory,
    eventId,
    eventTitle,
    isExclusive,
    nextDay,
    nextSlot,
    rolledLocation,
    rolledNpcLocations,
    rolledNewcomer,
  };
}
