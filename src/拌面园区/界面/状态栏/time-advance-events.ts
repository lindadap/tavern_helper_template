export type HeroineStage = '宠物期' | '暧昧期' | '恋爱期' | '妻子期';

export interface AdvanceContext {
  day: number;
  shaping: number;
  stage: HeroineStage;
}

export interface AdvanceHistory {
  exclusiveTriggered: Record<string, boolean>;
  recentCommonIds: string[];
}

export interface CommonEvent {
  id: string;
  category: '关系变好' | '关系变差' | '现代物品惊奇' | '猫娘闯祸';
  title: string;
  outline: string;
}

// Exclusive event weight when the current phase slot is still available (50%).
export const EXCLUSIVE_WEIGHT = 0.5;

// Common event pool shared across advances.
export const COMMON_EVENT_POOL: CommonEvent[] = [
  {
    id: 'bond_snack_truce',
    category: '关系变好',
    title: '半包小鱼干的休战协议',
    outline:
      '【视角要求】先写园区里吕青青与另一只平时有点怕她的猫娘（或园区其他异种娘）之间的互动，{{user}}暂不介入。' +
      '起因是那只猫娘在厨房够不到高处的零食罐，吕青青路过时冷着脸顺手替她拿下来，对方受宠若惊分了她半包鱼干。' +
      '两只猫居然靠在窗台边安静地一块儿啃完了，气氛莫名融洽起来。{{user}}在故事末尾路过时，正好看见平日里一见面就炸毛的两只猫难得挨着晒太阳的结果。',
  },
  {
    id: 'bond_grooming_nap',
    category: '关系变好',
    title: '午后客厅的意外合群',
    outline:
      '【视角要求】全程先聚焦园区里的异种娘们，{{user}}在末尾才推门回来看到结果。' +
      '午后停电空调停了一会儿，几只异种娘热得无精打采，吕青青嘴上嫌吵却默默把最凉快的瓷砖地和风扇位让出一半，还顺手帮旁边打瞌睡的小猫娘挡住刺眼阳光。' +
      '等{{user}}办完事回来时，看见原本各占山头的几只猫娘竟凑成一团打盹，关系明显热络了许多。',
  },
  {
    id: 'conflict_territory',
    category: '关系变差',
    title: '沙发黄金位的领地风波',
    outline:
      '园区里一只新来的/好胜的猫娘趁吕青青不在，霸占了客厅离{{user}}常坐位置最近的抱枕并留了气味。' +
      '吕青青回来后当场压平耳朵、尾巴炸开，双方互相哈气对峙、火药味十足，眼看就要动手把客厅掀翻。' +
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
    id: 'modern_phone_video',
    category: '现代物品惊奇',
    title: '方块里传来的猫叫声',
    outline:
      '客厅平板或手机不小心外放了一段猫咪叫声的短视频。几只猫娘围着发光的薄玻璃板团团转，甚至绕到屏幕背面找“藏在里面的猫”，' +
      '吕青青冷着脸戳了戳屏幕，发现摸不到毛又气又困惑，怀疑人类发明了什么装魂法器。' +
      '自然写出猫娘们被现代科技唬住的反差萌，留给{{user}}结尾互动。',
  },
  {
    id: 'modern_microwave',
    category: '现代物品惊奇',
    title: '叮一声变热的魔法铁箱',
    outline:
      '一只猫娘看着冷饭放进微波炉转几圈、“叮”一声就冒出热气，惊奇得眼睛发亮，拉着吕青青凑在玻璃门前研究里面的盘子为什么自己转。' +
      '她们正嘀咕能不能把冻硬的小鱼干或者湿毛巾也塞进去“施法”，差点把带锡纸的包装一起放进去，正好被刚进厨房的{{user}}撞见。',
  },
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
      '猫娘们嘴馋提前溜进厨房偷看晚饭准备的拌面酱，结果爪子一滑把酱料罐碰翻，浓郁的酱汁泼了一桌还沾到了猫爪和裙角上。' +
      '为了销毁证据，闯祸的猫娘一边偷舔爪子上的酱一边拿抹布越擦越花，彻底暴露了作案现场。{{user}}推门而入时正撞上这副惨状。',
  },
];

// Exclusive event for Lvqingqing: reporter interview ear-petting contrast.
// Triggers at most once in early stages (shaping < 180) and once in late stages (shaping >= 180).
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

  if (canTriggerExclusive && rng() < EXCLUSIVE_WEIGHT) {
    isExclusive = true;
    eventId = slotKey;
    nextHistory.exclusiveTriggered[slotKey] = true;
    eventTitle = isEarly ? '记者回访采访（前期）' : '记者回访采访（后期）';
    eventType = '吕青青专属事件';
    eventOutline = buildLvqingqingReporterOutline(ctx.stage);
  } else {
    const candidates = COMMON_EVENT_POOL.filter(e => !history.recentCommonIds.includes(e.id));
    const pool = candidates.length > 0 ? candidates : COMMON_EVENT_POOL;
    const picked = pool[Math.floor(rng() * pool.length)];

    eventId = picked.id;
    nextHistory.recentCommonIds = [...nextHistory.recentCommonIds, picked.id].slice(-4);
    eventTitle = picked.title;
    eventType = `公共事件·${picked.category}`;
    eventOutline = picked.outline;
  }

  const prompt = [
    `[时间推进] 距上次互动已过去5天，当前时间来到第${nextDay}天（请务必将变量「系统.天数」更新为${nextDay}）。`,
    `请先用2-3句话自然过渡这5天的园区日常，再严格围绕以下随机事件大纲展开剧情：`,
    `【${eventType}｜${eventTitle}】`,
    eventOutline,
    `要求：紧扣人物当前阶段人设（吕青青当前为${ctx.stage}，塑形度${ctx.shaping}），结尾自然留出给{{user}}介入或回应的空间。`,
  ].join('\n');

  return { prompt, nextHistory, eventId, eventTitle, isExclusive, nextDay };
}
