import { defineMvuDataStore } from '@util/mvu';
import { Schema } from '../../schema';

let store_definition: ReturnType<typeof defineMvuDataStore> | undefined;

/** 酒馆内使用: 实时同步本楼层 MVU 变量. 依赖酒馆助手环境, 预览模式下不可调用 */
export function useDataStore() {
  store_definition ??= defineMvuDataStore(Schema, {
    type: 'message',
    message_id: getCurrentMessageId(),
  });
  return store_definition();
}

const DEFAULT_DATA = {
  系统: { 天数: 1, 当前主角: '你' },
  吕青青: { 塑形度: 0, 心声: '', 情绪: '平静' },
  心情日志: {},
};

/** 酒馆外预览: 从 URL # 后读取变量 JSON, 与默认值合并后经 schema 校验/派生 */
export function resolvePreviewData(): Schema {
  const raw = decodeURIComponent(location.hash.slice(1)).trim();
  const provided = raw ? safeJsonParse(raw.replace(/^```[\w-]*\s*/i, '').replace(/```\s*$/, '')) : undefined;
  const merged = {
    ...DEFAULT_DATA,
    ...provided,
    系统: { ...DEFAULT_DATA.系统, ...provided?.系统 },
    吕青青: { ...DEFAULT_DATA.吕青青, ...provided?.吕青青 },
    心情日志: { ...provided?.心情日志 },
  };
  const result = Schema.safeParse(merged);
  if (result.error) {
    console.warn('[lvqingqing] 预览数据解析失败, 使用默认值:', result.error.message);
    return Schema.parse(DEFAULT_DATA);
  }
  return result.data;
}

function safeJsonParse(text: string): any {
  try {
    const parsed = JSON.parse(text);
    return typeof parsed?.stat_data === 'object' ? parsed.stat_data : parsed;
  } catch {
    return undefined;
  }
}
