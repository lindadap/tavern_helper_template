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
      <p>确认后时间将推进 5 天，并随机触发一件园区事件。</p>
      <div class="choices">
        <button type="button" class="btn-cancel" @click="close">取消</button>
        <button type="submit" class="btn-confirm">确认推进</button>
      </div>
    </form>
  </dialog>
</template>
<style scoped>
.action-bar { display:flex; justify-content:flex-end; position:relative; margin-top:12px; }
button { cursor:pointer; border:1px solid var(--c-border-glass); border-radius:20px; padding:9px 20px; background:var(--c-surface-strong); color:var(--c-text-primary); font:inherit; transition:transform 0.16s ease, opacity 0.2s ease; }
button:hover { transform:translateY(-1px); }
.special-button, .btn-confirm { background:linear-gradient(100deg,var(--c-primary),var(--c-stage)); color:#ffffff; border-color:transparent; font-weight:600; }
dialog {
  position: fixed;
  inset: 0;
  margin: auto;
  border: 1px solid color-mix(in srgb, var(--c-stage) 45%, #7b8fb8);
  border-radius: 18px;
  padding: 24px 22px 20px;
  width: min(340px, calc(100% - 32px));
  background: linear-gradient(160deg, #161d3f, #111633);
  color: #eef2ff;
  box-shadow: 0 18px 46px rgba(5, 10, 28, 0.58);
  text-align: center;
}
dialog::backdrop { background: rgba(6, 10, 24, 0.62); backdrop-filter: blur(3px); }
h3 { margin: 0 0 8px; font-size: 17px; letter-spacing: 1px; color: #f4f7ff; }
p { margin: 0 0 18px; line-height: 1.75; font-size: 13.5px; color: rgba(230, 236, 255, 0.82); }
.choices { display: flex; justify-content: center; align-items: center; gap: 12px; }
.choices button { min-width: 102px; padding: 8px 18px; font-size: 13.5px; }
.btn-cancel { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.22); color: #dce4ff; }
</style>
