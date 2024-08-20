/*
 * @author igdianov
 * address https://github.com/igdianov/activiti-bpmn-moddle
 * */

export default {
  __init__: ['FlowableModdleExtension'],
  FlowableModdleExtension: ['type', (await import('./flowableExtension')).default],
};
