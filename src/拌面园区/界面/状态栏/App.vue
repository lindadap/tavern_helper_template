<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import LvqingqingPanel from './components/lvqingqing/LvqingqingPanel.vue';
import { useDataStore, resolvePreviewData } from './store';
import { requestTimeAdvance } from './time-advance';
import { ROSTER_SOFT_CAP, Schema, type CompanyLocation, type RosterMember } from '../../schema';
import { resolveImpressionColorHex } from '../../heteromorph-pool';
import type { MapOccupant } from './map-data';
import { readRosterArchive, writeRosterArchive, type RosterArchiveMap } from './roster-archive';

const props = defineProps<{ source: 'tavern' | 'preview' }>();
const store = props.source === 'tavern' ? useDataStore() : undefined;
const preview = props.source === 'preview' ? ref<Schema>(resolvePreviewData()) : undefined;
const data = computed(() => store?.data ?? preview!.value);

const archive = ref<RosterArchiveMap>(readRosterArchive(props.source));
const message = ref('');
const pending = ref(false);
const mapBusy = ref(false);
const mapNotice = ref('');
const rosterNotice = ref('');

function checkIsLatestFloor() {
  if (props.source === 'preview') return true;
  if (typeof getCurrentMessageId !== 'function' || typeof getLastMessageId !== 'function') return true;
  return getCurrentMessageId() === getLastMessageId();
}

const canEditMap = ref(checkIsLatestFloor());
let floorTimer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  if (props.source === 'tavern') {
    floorTimer = setInterval(() => {
      canEditMap.value = checkIsLatestFloor();
      archive.value = readRosterArchive(props.source);
    }, 2000);
  }
});

onBeforeUnmount(() => {
  if (floorTimer !== undefined) clearInterval(floorTimer);
});

const occupants = computed<MapOccupant[]>(() => {
  const list: MapOccupant[] = [
    { id: 'player', name: '你', kind: 'player', location: data.value.系统.玩家位置 },
    { id: 'lvqingqing', name: '吕青青', kind: 'heroine', location: data.value.吕青青.位置 },
  ];
  for (const [name, member] of Object.entries(data.value.名册)) {
    list.push({
      id: `roster:${name}`,
      name,
      kind: 'npc',
      location: member.位置,
      color: resolveImpressionColorHex(member.印象颜色),
    });
  }
  return list;
});

function cloneSchema(src: Schema): Schema {
  const rosterCopy: Record<string, RosterMember> = {};
  for (const [k, v] of Object.entries(src.名册)) {
    rosterCopy[k] = { ...v };
  }
  return {
    系统: { ...src.系统 },
    吕青青: { ...src.吕青青 },
    名册: rosterCopy,
  };
}

async function persistStatUpdate(
  apply: (draft: Schema) => void,
  onSuccess: () => void,
  onError: () => void,
) {
  if (mapBusy.value) return;
  canEditMap.value = checkIsLatestFloor();
  if (!canEditMap.value) {
    onError();
    return;
  }

  mapBusy.value = true;
  try {
    const draft = cloneSchema(data.value);
    apply(draft);
    const validated = Schema.parse(draft);

    if (props.source === 'preview') {
      preview!.value = validated;
    } else {
      store!.data = validated;
      const messageId = getCurrentMessageId();
      await updateVariablesWith(
        vars => {
          vars.stat_data = validated;
          return vars;
        },
        { type: 'message', message_id: messageId },
      );
    }

    onSuccess();
  } catch (error) {
    console.error('[拌面园区]', error);
    onError();
  } finally {
    mapBusy.value = false;
  }
}

async function movePlayer(location: CompanyLocation) {
  await persistStatUpdate(
    draft => {
      draft.系统.玩家位置 = location;
    },
    () => {
      mapNotice.value = `已前往 ${location}`;
    },
    () => {
      mapNotice.value = canEditMap.value ? '位置更新失败，请重试' : '仅最新楼层可操作';
    },
  );
}

async function archiveMember(name: string) {
  if (mapBusy.value) return;
  canEditMap.value = checkIsLatestFloor();
  if (!canEditMap.value) {
    rosterNotice.value = '仅最新楼层可操作名册';
    return;
  }

  const target = data.value.名册[name];
  if (!target) return;

  mapBusy.value = true;
  try {
    const nextArchive: RosterArchiveMap = {
      ...archive.value,
      [name]: { ...target, archivedDay: data.value.系统.天数 },
    };
    const draft = cloneSchema(data.value);
    delete draft.名册[name];
    const validated = Schema.parse(draft);

    await writeRosterArchive(props.source, nextArchive);
    archive.value = nextArchive;

    if (props.source === 'preview') {
      preview!.value = validated;
    } else {
      store!.data = validated;
      const messageId = getCurrentMessageId();
      await updateVariablesWith(
        vars => {
          vars.stat_data = validated;
          return vars;
        },
        { type: 'message', message_id: messageId },
      );
    }

    rosterNotice.value = `已将 ${name} 外派归档，随时可在档案库召回`;
  } catch (error) {
    console.error('[拌面园区]', error);
    rosterNotice.value = '外派归档失败，请重试';
  } finally {
    mapBusy.value = false;
  }
}

async function recallMember(name: string) {
  if (mapBusy.value) return;
  canEditMap.value = checkIsLatestFloor();
  if (!canEditMap.value) {
    rosterNotice.value = '仅最新楼层可操作名册';
    return;
  }
  if (Object.keys(data.value.名册).length >= ROSTER_SOFT_CAP) {
    rosterNotice.value = `当前在园已满 ${ROSTER_SOFT_CAP} 人，请先外派归档一名成员`;
    return;
  }

  const archived = archive.value[name];
  if (!archived) return;

  mapBusy.value = true;
  try {
    const { archivedDay: _ignored, ...memberData } = archived;
    const draft = cloneSchema(data.value);
    draft.名册[name] = { ...memberData, 位置: '办公区' };
    const validated = Schema.parse(draft);

    const nextArchive: RosterArchiveMap = { ...archive.value };
    delete nextArchive[name];

    await writeRosterArchive(props.source, nextArchive);
    archive.value = nextArchive;

    if (props.source === 'preview') {
      preview!.value = validated;
    } else {
      store!.data = validated;
      const messageId = getCurrentMessageId();
      await updateVariablesWith(
        vars => {
          vars.stat_data = validated;
          return vars;
        },
        { type: 'message', message_id: messageId },
      );
    }

    rosterNotice.value = `已将 ${name} 召回园区（当前在办公区报到）`;
  } catch (error) {
    console.error('[拌面园区]', error);
    rosterNotice.value = '召回失败，请重试';
  } finally {
    mapBusy.value = false;
  }
}

async function advance() {
  if (pending.value) return;
  pending.value = true;
  try {
    message.value = await requestTimeAdvance(props.source, data.value);
  } catch (error) {
    console.error(error);
    message.value = '发送失败，请检查聊天记录后重试。';
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <LvqingqingPanel
    player-name="你"
    :day="data.系统.天数"
    :heroine="data.吕青青"
    :player-location="data.系统.玩家位置"
    :occupants="occupants"
    :roster="data.名册"
    :archive="archive"
    :map-busy="mapBusy"
    :map-notice="mapNotice"
    :roster-notice="rosterNotice"
    :can-edit-map="canEditMap"
    @special-event="advance"
    @move-player="movePlayer"
    @archive-member="archiveMember"
    @recall-member="recallMember"
  />
  <p v-if="message" class="notice" role="status">{{ message }}</p>
</template>

<style scoped>
.notice {
  max-width: 470px;
  margin: 10px auto;
  font-size: 13px;
  color: #a6a6b7;
  text-align: right;
}
</style>
