<script setup lang="ts">
import { ref } from 'vue';
const emit = defineEmits<{ trigger: [] }>();
const opened = ref(false);
const dialog = ref<HTMLDialogElement>();
function open() { opened.value = true; dialog.value?.showModal(); }
function close() { dialog.value?.close(); opened.value = false; }
function confirm() { close(); emit('trigger'); }
</script>
<template>
  <footer class="action-bar"><button class="special-button" type="button" @click="open">时间推进</button></footer>
  <dialog ref="dialog" aria-labelledby="advance-title" @close="opened = false" @cancel="opened = false">
    <form method="dialog" @submit.prevent="confirm">
      <h3 id="advance-title">时间推进</h3>
      <p>点击确认后，时间将推进5天，并随机触发一个事件。</p>
      <div class="choices"><button type="button" @click="close">否</button><button type="submit">确认</button></div>
    </form>
  </dialog>
</template>
<style scoped>
.action-bar { display:flex; justify-content:flex-end; position:relative; margin-top:12px; }
button { cursor:pointer; border:1px solid var(--c-border-glass); border-radius:20px; padding:9px 20px; background:var(--c-surface-strong); color:var(--c-text-primary); font:inherit; }
.special-button,button[type='submit'] { background:linear-gradient(100deg,var(--c-primary),var(--c-stage)); color:white; }
dialog { border:1px solid #73739a; border-radius:18px; padding:22px; width:min(360px,calc(100% - 28px)); background:#151b38; color:#eef2ff; }
dialog::backdrop { background:#0009; }
h3 { margin:0; font-size:17px; } p { line-height:1.8; font-size:14px; } .choices { display:flex; justify-content:flex-end; gap:12px; }
dialog button { background:#303956; color:#fff; }
</style>
