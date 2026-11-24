<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import LvqingqingPanel from './components/lvqingqing/LvqingqingPanel.vue';
import { useDataStore, resolvePreviewData } from './store';
import { requestTimeAdvance } from './time-advance';
import { Schema, type CompanyLocation } from '../../schema';
import type { MapOccupant } from './map-data';

const props = defineProps<{ source: 'tavern' | 'preview' }>();
const store = props.source === 'tavern' ? useDataStore() : undefined;
const preview = props.source === 'preview' ? ref<Schema>(resolvePreviewData()) : undefined;
const data = computed(() => store?.data ?? preview!.value);

const message = ref('');
const pending = ref(false);
const mapBusy = ref(false);
const mapNotice = ref('');

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
    }, 2000);
  }
});

onBeforeUnmount(() => {
  if (floorTimer !== undefined) clearInterval(floorTimer);
});

const occupants = computed<MapOccupant[]>(() => [
  { id: 'player', name: '你', kind: 'player', location: data.value.系统.玩家位置 },
  { id: 'lvqingqing', name: '吕青青', kind: 'npc', location: data.value.吕青青.位置 },
]);

async function persistMapUpdate(apply: (draft: Schema) => void, successText: string) {
  if (mapBusy.value) return;
  canEditMap.value = checkIsLatestFloor();
  if (!canEditMap.value) {
    mapNotice.value = '仅最新楼层可操作';
    return;
  }

  mapBusy.value = true;
  try {
    const draft: Schema = {
      系统: { ...data.value.系统 },
      吕青青: { ...data.value.吕青青 },
    };
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

    mapNotice.value = successText;
  } catch (error) {
    console.error('[拌面园区]', error);
    mapNotice.value = '位置更新失败，请重试';
  } finally {
    mapBusy.value = false;
  }
}

async function movePlayer(location: CompanyLocation) {
  await persistMapUpdate(draft => {
    draft.系统.玩家位置 = location;
  }, `已前往 ${location}`);
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
    :map-busy="mapBusy"
    :map-notice="mapNotice"
    :can-edit-map="canEditMap"
    @special-event="advance"
    @move-player="movePlayer"
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
