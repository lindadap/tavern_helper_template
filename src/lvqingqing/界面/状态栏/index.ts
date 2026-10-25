import App from './App.vue';
import './global.css';

const IN_TAVERN = typeof getCurrentMessageId === 'function';

async function bootstrap() {
  if (IN_TAVERN) {
    await waitGlobalInitialized('Mvu');
    await waitUntil(() => _.has(getVariables({ type: 'message' }), 'stat_data'), { timeout: 10000 }).catch(() => {
      console.warn('[lvqingqing] 等待本楼层 MVU 变量超时, 界面将以默认数据先行渲染');
    });
    createApp(App, { source: 'tavern' }).use(createPinia()).mount('#app');
  } else {
    createApp(App, { source: 'preview' }).mount('#app');
  }
}

if (typeof $ === 'function') {
  $(bootstrap);
} else {
  void bootstrap();
}
