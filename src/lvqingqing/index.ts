import { createApp } from 'vue';
// 内置副本, 源组件: C:\Users\lindap\Desktop\Silly\moyue\src\吕青青\界面\StatusBar.vue (改动后需重新拷贝)
import StatusBar from './StatusBar.vue';

const app = createApp(StatusBar, {
  mvu: (window as any).__MVU_DATA__ || {
    系统: { 天数: 1, 当前主角: '你' },
    吕青青: {
      塑形度: 0,
      心声: '',
      情绪: '平静',
      $阶段: '顺从期',
      $身份认知: '宠物兼打手',
    },
    心情日志: {},
  },
});

app.mount('#app');
