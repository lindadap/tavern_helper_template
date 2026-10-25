export const Schema = z.object({
  系统: z.object({
    天数: z.coerce
      .number()
      .catch(1)
      .transform(v => Math.min(Math.max(v, 1), 999)),
    当前主角: z.string().catch('你'),
  }),

  吕青青: z
    .object({
      塑形度: z.coerce
        .number()
        .catch(0)
        .transform(v => Math.min(Math.max(v, 0), 200)),
      心声: z.string().catch(''),
      情绪: z.enum(['平静', '开心', '发情', '生气', '暴怒', '伤心', '无语', '害羞']).catch('平静'),
    })
    .transform(data => {
      const $阶段 = data.塑形度 <= 60 ? '顺从期' : data.塑形度 <= 120 ? '暧昧期' : '妻子期';
      const $身份认知 = data.塑形度 <= 60 ? '宠物兼打手' : data.塑形度 <= 120 ? '想要被选择的少女' : '妻子';
      return { ...data, $阶段, $身份认知 };
    }),

  心情日志: z
    .record(z.string().describe('天数'), z.string().describe('当日心情'))
    .default({})
    .transform(data => Object.fromEntries(Object.entries(data).filter(([, v]) => v && v.length > 0))),
});

export type Schema = z.output<typeof Schema>;
