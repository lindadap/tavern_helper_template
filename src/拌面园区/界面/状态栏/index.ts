import lodash from 'lodash';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './global.css';
Object.assign(globalThis, { _: lodash });
async function bootstrap() {
  try {
    const source = typeof getCurrentMessageId === 'function' ? 'tavern' : 'preview';
    if (source === 'tavern') {
      await waitGlobalInitialized('Mvu');
      const messageId = getCurrentMessageId();
      let initialized = false;
      for (let attempt = 0; attempt < 120; attempt++) {
        if (_.has(getVariables({ type: 'message', message_id: messageId }), 'stat_data')) {
          initialized = true;
          break;
        }
        document.querySelector('#app')!.textContent = '正在等待本楼层变量初始化…';
        await new Promise(resolve => setTimeout(resolve, 250));
      }
      if (!initialized) throw new Error('本楼层尚无stat_data，请确认MVU脚本已启用，并新建聊天初始化变量。');
    }
    const app = createApp(App, { source }).use(createPinia());
    app.mount('#app');
    window.addEventListener('pagehide', () => app.unmount(), { once: true });
  } catch (error) {
    console.error('[拌面园区]', error);
    const detail = error instanceof Error ? error.message : String(error);
    document.querySelector('#app')!.textContent = `状态栏加载失败：${detail}`;
  }
}
if (typeof $ === 'function') $(bootstrap); else void bootstrap();
