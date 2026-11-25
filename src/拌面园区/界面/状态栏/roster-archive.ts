import { RosterMemberSchema, type RosterMember } from '../../schema';

const ARCHIVE_KEY = 'banmian_roster_archive';

export interface ArchivedRosterMember extends RosterMember {
  archivedDay: number;
}

export type RosterArchiveMap = Record<string, ArchivedRosterMember>;

function sanitizeArchive(raw: unknown): RosterArchiveMap {
  if (!raw || typeof raw !== 'object') return {};
  const result: RosterArchiveMap = {};
  for (const [name, entry] of Object.entries(raw as Record<string, unknown>)) {
    const trimmed = name.trim();
    if (!trimmed || !entry || typeof entry !== 'object') continue;
    const parsed = RosterMemberSchema.safeParse(entry);
    if (!parsed.success) continue;
    const rawDay = Number((entry as Record<string, unknown>).archivedDay);
    result[trimmed] = {
      ...parsed.data,
      archivedDay: Number.isFinite(rawDay) && rawDay >= 1 ? Math.round(rawDay) : 1,
    };
  }
  return result;
}

export function readRosterArchive(source: 'tavern' | 'preview'): RosterArchiveMap {
  if (source === 'preview') return {};
  const vars = getVariables({ type: 'chat' }) as Record<string, unknown> | undefined;
  return sanitizeArchive(vars?.[ARCHIVE_KEY]);
}

export async function writeRosterArchive(
  source: 'tavern' | 'preview',
  archive: RosterArchiveMap,
): Promise<void> {
  if (source === 'preview') return;
  await updateVariablesWith(
    vars => {
      vars[ARCHIVE_KEY] = archive;
      return vars;
    },
    { type: 'chat' },
  );
}
