import { defineStore } from 'pinia';
import { ANY_OBJECT } from '@/types/generic';
import { FlowOperationController } from '@/api/flow';

// 催办消息轮询间隔
const MESSAGE_TIMER_INTERVAL = 1000 * 60 * 5;

export default defineStore('message', {
  state: () => {
    return {
      messageTimer: undefined as number | undefined,
      messageCount: {} as ANY_OBJECT,
    };
  },
  actions: {
    setMessageTimer(timer: number) {
      this.messageTimer = timer;
    },
    setMessageCount(data: ANY_OBJECT) {
      //console.log('setMessageCount >>>', data);
      if (data) {
        data.totalCount = data.copyMessageCount + data.remindingMessageCount;
      }
      this.messageCount = data;
    },
    // 获得消息列表数据
    loadMessage() {
      FlowOperationController.getMessageCount(
        {},
        {
          showMask: false,
          showError: false,
        },
      )
        .then(res => {
          this.setMessageCount(res.data);
        })
        .catch(e => {
          console.error(e);
        });
    },
    startMessage() {
      if (this.messageTimer) {
        clearInterval(this.messageTimer);
      }

      this.messageTimer = setInterval(() => {
        this.loadMessage();
      }, MESSAGE_TIMER_INTERVAL);
      this.loadMessage();
    },
    stopMessage() {
      if (this.messageTimer) {
        clearInterval(this.messageTimer);
      }
      this.messageTimer = undefined;
    },
    reloadMessage() {
      this.loadMessage();
    },
  },
});
