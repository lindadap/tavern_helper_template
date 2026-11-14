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
      await waitUntil(() => _.has(getVariables({ type: 'message', message_id: getCurrentMessageId() }), 'stat_data'), { timeout: 10000 });
    }
    const app = createApp(App, { source }).use(createPinia());
    app.mount('#app');
    window.addEventListener('pagehide', () => app.unmount(), { once: true });
  } catch (error) {
    console.error('[拌面园区]', error);
    document.querySelector('#app')!.textContent = '状态栏加载失败，请检查变量数据。';
  }
}
if (typeof $ === 'function') $(bootstrap); else void bootstrap();
