// 可反复触发的特殊事件池 (吴恬恬登场后, 每次点击「触发事件」随机抽取一个注入)
// 只有「吴恬恬初登场」是一次性事件, 由 App.vue 的解锁流程单独处理
import type { Schema } from '../../schema';

export interface EventContext {
  playerName: string;
  focused: 'lvqingqing' | 'wutiantian';
  data: Schema;
}

export interface SpecialEvent {
  id: string;
  title: string;
  /** any=任意聚焦可用; lvqingqing/wutiantian=需要对应女主聚焦; both=双女主均已登场 */
  requires: 'any' | 'lvqingqing' | 'wutiantian' | 'both';
  /** 额外条件 (如阶段/数值门槛), 返回 false 则不进入候选 */
  condition?: (ctx: EventContext) => boolean;
  build: (ctx: EventContext) => string;
}

function directive(lines: string[]): string {
  return ['# 一次性剧情指令 (仅对本次生成生效)', ...lines].join('\n');
}

function focusedName(ctx: EventContext): string {
  return ctx.focused === 'wutiantian' ? '吴恬恬' : '吕青青';
}

function stageBand(value: number): 'low' | 'mid' | 'high' {
  if (value <= 60) return 'low';
  if (value <= 120) return 'mid';
  return 'high';
}

export const EVENT_POOL: SpecialEvent[] = [
  {
    id: 'vending-machine',
    title: '自动售货机的奇迹',
    requires: 'any',
    build: ctx =>
      directive([
        `请演出一段「${focusedName(ctx)}与自动售货机」的日常小剧场。`,
        `设定: ${ctx.playerName} 带${focusedName(ctx)}路过街角的自动售货机。她对这台"吞硬币就会吐出饮料的铁箱子"充满惊奇——投币的仪式感、硬币吞下去的声音、咚的一声掉下来的罐子, 每一步都让她眼睛发亮。`,
        '要求:',
        '- 写出她面对现代社会造物时特有的惊奇与可爱的误解 (比如对机器鞠躬道谢、想把硬币塞回去)',
        `- ${ctx.playerName} 在旁看着, 两人有自然的互动与对话`,
        '- 轻松温馨的小品, 不推进大剧情, 结尾留一个温暖的小尾巴',
      ]),
  },
  {
    id: 'first-message',
    title: '第一条消息',
    requires: 'any',
    build: ctx =>
      directive([
        `请演出「${focusedName(ctx)}的第一条消息」。`,
        `设定: ${ctx.playerName} 给${focusedName(ctx)}配了一部手机并教她用聊天软件。当晚她躲在自己房间里, 对着输入框纠结了很久, 终于给${ctx.playerName}发出了人生第一条消息。`,
        '要求:',
        '- 描写她打字时的心理活动: 删了又写、写了又删、错字连篇、表情包乱用',
        `- ${ctx.playerName} 的手机震动, 看到消息后的反应, 以及两人一来一往的短信往来 (消息原文要写出来)`,
        '- 从消息内容里体现她当下的性格与对主人的依恋, 结尾温暖',
      ]),
  },
  {
    id: 'supermarket',
    title: '第一次逛超市',
    requires: 'any',
    build: ctx =>
      directive([
        `请演出「${focusedName(ctx)}第一次逛超市」。`,
        `设定: ${ctx.playerName} 带${focusedName(ctx)}去大型超市采购。琳琅满目的货架、生鲜区的鱼、零食区的一切, 对她来说都是新大陆。`,
        '要求:',
        '- 写出猫娘本能的瞬间: 在生鲜区挪不动步、尾巴不受控制地甩动、偷偷把喜欢的零食放进购物车',
        '- 加入一两个小插曲 (比如试吃摊、广播里突然的人声吓她一跳)',
        `- ${ctx.playerName} 的宠溺与纵容要自然, 结账后她对小票这个"宝物"的态度作结`,
      ]),
  },
  {
    id: 'harem-fire',
    title: '后宫起火',
    requires: 'both',
    build: ctx =>
      directive([
        '请演出一场「后宫起火」的争宠小剧场。',
        `设定: 吕青青和吴恬恬的醋意因为一件小事被点燃了——也许是${ctx.playerName}今晚先夸了其中一个, 也许是晚饭时把最后一块肉夹给了其中一个。两只猫娘开始暗中较量: 抢座位、抢尾巴缠绕权、抢膝枕资格。`,
        '要求:',
        '- 争宠方式要符合两人各自的性格: 吕青青冷着脸宣示主权, 吴恬恬软软地撒娇夹击',
        `- 有剑拔弩张的火花, 但不真正撕破脸, 最终由${ctx.playerName}出面安抚`,
        '- 结尾两人达成微妙的平衡 (或约定), 并各自向主人索要补偿',
      ]),
  },
  {
    id: 'bond-warmer',
    title: '猫娘们变好了',
    requires: 'both',
    build: ctx =>
      directive([
        '请演出一段「猫娘之间悄悄变好」的温馨剧情。',
        `设定: ${ctx.playerName}偶然撞见吕青青和吴恬恬独处时的亲密一幕——也许是分享同一盘鱼干, 也许是互相梳理耳朵后面的毛发, 也许是午后阳光里叠在一起午睡。`,
        '要求:',
        '- 描写两人平时不会在主人面前展露的、属于猫娘之间的默契与柔软',
        `- 被发现时的慌张与嘴硬 (尤其是吕青青的别扭), 以及${ctx.playerName}看在眼里的欣慰`,
        '- 温暖治愈, 体现这个家正在变成真正的"家"',
      ]),
  },
  {
    id: 'bond-chill',
    title: '猫娘们闹别扭',
    requires: 'both',
    build: ctx =>
      directive([
        '请演出一段「猫娘之间闹别扭」需要调解的剧情。',
        `设定: 吕青青和吴恬恬冷战了。起因可以是不小心弄坏了对方珍视的东西、抢占了晒太阳的最佳位置、或一句话戳到了痛处。两只猫娘谁也不肯先低头, 家里气氛降至冰点。`,
        '要求:',
        '- 冷战的表现要符合猫娘特质: 背对背、尾巴互相嫌弃地扫开、吃饭时隔最远',
        `- ${ctx.playerName} 察觉后想方设法调解 (可以是一次三方谈话、也可以是一个小计谋)`,
        '- 结尾和好, 但和好的方式要有笑点或泪点, 不落俗套',
      ]),
  },
  {
    id: 'tummy-ache',
    title: '恬恬的胃',
    requires: 'wutiantian',
    build: ctx =>
      directive([
        '请演出「吴恬恬的胃病发作之夜」。',
        `设定: 深夜, 吴恬恬的胃病突然发作。她习惯性地蜷缩起来忍耐, 不想吵醒任何人——她害怕自己"太麻烦"。但疼痛越来越剧烈, 猫耳紧紧贴在头上, 冷汗浸湿了睡裙。`,
        '要求:',
        `- 从她的忍耐写起, 到被${ctx.playerName}发现的那一刻 (可以是微弱的猫叫声暴露了她)`,
        `- ${ctx.playerName} 的照顾过程要有细节: 温水、揉肚子、轻声安慰、彻夜陪伴`,
        '- 体现「病树繁花」意象: 病是病根, 但被爱着的时刻开出花来',
        '- 结尾她在他怀里睡着, 说一句让人心疼的梦话',
      ]),
  },
  {
    id: 'night-guard',
    title: '青青的守望',
    requires: 'lvqingqing',
    condition: ctx => ctx.data.吕青青.塑形度 > 60,
    build: ctx =>
      directive([
        '请演出「深夜的守望者」。',
        `设定: 凌晨, ${ctx.playerName}起夜时发现吕青青正守在他房门口的地板上打盹, 抱着膝盖, 猫耳却还警觉地立着——她守了不知道多久。`,
        '要求:',
        '- 通过盘问写出她别扭的守护理由 ("…顺手""…那边地板凉快", 决不承认是担心)',
        `- ${ctx.playerName} 戳破她的嘴硬, 两人之间安静的深夜对话`,
        '- 体现塑形度上升后她"只想守护主人"的心理, 结尾是把她拎回房间或允许她留下',
      ]),
  },
  {
    id: 'snack-cache',
    title: '藏零食的小偷',
    requires: 'wutiantian',
    condition: ctx => (ctx.data.吴恬恬?.养分值 ?? 0) >= 140,
    build: ctx =>
      directive([
        '请演出「藏零食的小偷被抓获」。',
        `设定: ${ctx.playerName}发现家里的零食总是神秘消失。今晚终于抓到了现行——吴恬恬的房间床垫下、枕头里、衣柜深处, 藏着一个惊人的零食宝库。`,
        '要求:',
        '- 被抓包时她的羞愧与慌乱: "又爱又怕"的心理, 猫耳不安地抖动',
        `- ${ctx.playerName} 的处理方式: 不是责骂, 而是约定 (适量、和她一起吃、换成对胃温和的零食)`,
        '- 轻喜剧氛围里带一点心疼, 结尾她主动上交一部分"赃物"作为赔罪',
      ]),
  },
  {
    id: 'rain-day',
    title: '雨天共伞',
    requires: 'any',
    build: ctx =>
      directive([
        `请演出「与${focusedName(ctx)}的雨天」。`,
        `设定: 外出时突降大雨, ${ctx.playerName}和${focusedName(ctx)}只有一把伞。回家的路被雨水打湿, 两个人挤在一把伞下。`,
        '要求:',
        '- 描写伞下的距离感变化: 从刻意保持距离, 到肩膀相贴, 到她悄悄攥住他的衣角',
        '- 猫娘讨厌淋雨的细节 (耳朵进水、炸毛、甩水的动作)',
        '- 雨声作为氛围, 结尾到家时的温暖瞬间 (热毛巾、姜茶、或她的一句心里话)',
      ]),
  },
  {
    id: 'lq-discipline-caught',
    title: '收起爪子',
    requires: 'lvqingqing',
    build: ctx => {
      const band = stageBand(ctx.data.吕青青.塑形度);
      const reaction =
        band === 'low'
          ? '低塑形度：立刻收起爪子，得意自己是主人最棒最强的猫猫，找主人讨赏。'
          : band === 'mid'
            ? '中塑形度：羞涩，后怕暴力的一面被心上人看见。可以吹口哨转移注意力，也可以落荒而逃。'
            : '高塑形度：招呼主人过来一起教训犯错的异种娘，摆出老板娘的气势。';
      return directive([
        '请演出「吕青青教训其他异种娘时被主人撞见」。',
        `设定: ${ctx.playerName} 撞见吕青青正在教训其他异种娘。她一看见主人，立刻收起爪子。当前塑形度 ${ctx.data.吕青青.塑形度}。`,
        `反应只走这一档: ${reaction}`,
        '要求: 按大纲发挥，保留被撞见、收爪子和这一档反应，不替玩家做决定。',
      ]);
    },
  },
  {
    id: 'lq-social-review',
    title: '社会化评选',
    requires: 'lvqingqing',
    build: ctx => {
      const band = stageBand(ctx.data.吕青青.塑形度);
      const reaction =
        band === 'low'
          ? '低塑形度：因为可爱大受欢迎，享受一群人类男女安稳的大手揉耳朵，享受投喂。记者给公司全体打满分并高强度夸赞主人。事后她从怀里拿出藏起来的零食献给主人。'
          : band === 'mid'
            ? '中塑形度：尴尬而顺从地接受抚摸，对其他男性摸耳朵明显抗拒；被女孩子摸时也用湿润的眼睛盯着主人，怕被误会。记者敬佩驯服能力并打出高分。事后她单独把所有零食献给主人讨饶，用更甜美、更顺从的态度讨好。'
            : '高塑形度：拒绝所有人抚摸，用有逻辑而温和的话表明只允许主人摸耳朵，然后配合拍照摆姿势，收下零食。记者依旧打出高分。';
      return directive([
        '请演出「吕青青代表参加异种娘社会化程度评选」。',
        `设定: 定期评选，她因为可爱而大受欢迎。当前塑形度 ${ctx.data.吕青青.塑形度}。`,
        `反应只走这一档: ${reaction}`,
        '要求: 按大纲发挥有趣的现场细节，不替玩家做决定。',
      ]);
    },
  },
  {
    id: 'wt-stomach-flare',
    title: '胃病与甜点',
    requires: 'wutiantian',
    build: ctx =>
      directive([
        '请演出「吴恬恬犯胃病，主人带着甜点来到宿舍」。',
        `设定: ${ctx.playerName} 一开门，发现她因为胃病发作而变得纤细可爱。养分值在这次事件里当场变为 60，已结算阶段改为纤细。`,
        '要求: 她变得更喜欢撒娇和黏人，往主人怀里窝。按大纲发挥，不替玩家做决定。',
      ]),
  },
  {
    id: 'wt-sleeping-beauty',
    title: '装睡的睡美人',
    requires: 'wutiantian',
    build: ctx =>
      directive([
        '请演出「吴恬恬在宿舍装睡」。',
        `设定: ${ctx.playerName} 来到宿舍，门内有各种声音。进去后发现她正在装睡，书桌上有《睡美人》。她把嘴巴微微嘟起，看起来很可爱。`,
        '要求: 停在这个画面，不要替玩家做决定，不要替她揭穿或推进下一步。',
      ]),
  },
];

/** 从当前阶段的事件池随机抽取一个 */
export function pickRandomEvent(ctx: EventContext, pool: SpecialEvent[]): SpecialEvent | undefined {
  const candidates = pool.filter(e => {
    if (e.requires === 'lvqingqing' && ctx.focused !== 'lvqingqing') return false;
    if (e.requires === 'wutiantian' && ctx.focused !== 'wutiantian') return false;
    if (e.requires === 'both' && ctx.data.系统.已登场?.['吴恬恬'] !== true) return false;
    if (e.condition && !e.condition(ctx)) return false;
    return true;
  });
  if (candidates.length === 0) return undefined;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
