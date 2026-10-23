import { createApp } from 'vue';
import { StatusBar } from '../../../moyue/src/吕青青/界面';

const app = createApp(StatusBar, {
  mvu: (window as any).__MVU_DATA__ || {
    系统: { 天数: 1, 当前主角: '{{user}}' },
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
