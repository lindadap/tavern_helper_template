<script setup lang="ts">
import { computed, ref } from 'vue';
import LvqingqingPanel from './components/lvqingqing/LvqingqingPanel.vue';
import { useDataStore, resolvePreviewData } from './store';
import { requestTimeAdvance } from './time-advance';
const props = defineProps<{ source: 'tavern' | 'preview' }>();
const store = props.source === 'tavern' ? useDataStore() : undefined;
const preview = props.source === 'preview' ? resolvePreviewData() : undefined;
const data = computed(() => store?.data ?? preview!);
const message = ref('');
const pending = ref(false);
async function advance() {
  if (pending.value) return;
  pending.value = true;
  try { message.value = await requestTimeAdvance(props.source); }
  catch (error) { console.error(error); message.value = '发送失败，请检查聊天记录后重试。'; }
  finally { pending.value = false; }
}
</script>
<template>
  <LvqingqingPanel player-name="你" :day="data.系统.天数" :heroine="data.吕青青" @special-event="advance" />
  <p v-if="message" class="notice" role="status">{{ message }}</p>
</template>
<style scoped>.notice { max-width:470px; margin:10px auto; font-size:13px; color:#a6a6b7; text-align:right; }</style>
