export const Schema = z.object({
  系统: z.object({
    天数: z.coerce
      .number()
      .catch(1)
      .transform(v => Math.min(Math.max(v, 1), 999)),
    当前主角: z.string().catch('吕青青'),
    // 登场标记: 角色名 → 是否已在剧情中登场 (驱动状态栏解锁)
    已登场: z.record(z.string(), z.boolean()).catch({}).default({}),
    日常已触发: z.coerce.number().catch(0).transform(v => Math.max(0, v)),
  }),

  吕青青: z
    .object({
      塑形度: z.coerce
        .number()
        .catch(0)
        .transform(v => Math.min(Math.max(v, 0), 200)),
      心声: z.string().catch(''),
      情绪: z.enum(['害羞', '情动', '生气', '平静', '高兴', '委屈', '被安抚', '吃醋']).catch('平静'),
    })
    .transform(data => {
      const $阶段 = data.塑形度 <= 60 ? '顺从期' : data.塑形度 <= 120 ? '暧昧期' : '妻子期';
      const $身份认知 = data.塑形度 <= 60 ? '宠物兼打手' : data.塑形度 <= 120 ? '想要被选择的少女' : '妻子';
      return { ...data, $阶段, $身份认知 };
    }),

  // 吴恬恬: 养分 0-200。阶段看「已结算阶段」, 当天的增减不立刻改体型。
  吴恬恬: z
    .object({
      养分值: z.coerce
        .number()
        .catch(20)
        .transform(v => Math.min(Math.max(v, 0), 200)),
      已结算阶段: z.enum(['初始', '纤细', '匀称', '丰满', '超重']).catch('初始'),
      心声: z.string().catch(''),
      情绪: z.enum(['害怕', '平静', '开心', '委屈', '被安抚', '害羞', '心动', '发情', '撒娇', '动情', '挑逗', '愉悦']).catch('平静'),
    })
    .transform(data => {
      const $待结算阶段 =
        data.养分值 < 40 ? '初始' : data.养分值 < 90 ? '纤细' : data.养分值 < 140 ? '匀称' : data.养分值 < 190 ? '丰满' : '超重';
      return { ...data, $待结算阶段 };
    })
    .optional()
    .catch(undefined),
});

export type Schema = z.output<typeof Schema>;
