import { ANY_OBJECT } from '@/types/generic';

// 创建监听器实例
export function createListenerObject(options: ANY_OBJECT, isTask: boolean, prefix: string) {
  const listenerObj = Object.create(null);
  listenerObj.event = options.event;
  isTask && (listenerObj.id = options.id); // 任务监听器特有的 id 字段
  switch (options.listenerType) {
    case 'scriptListener':
      listenerObj.script = createScriptObject(options, prefix);
      listenerObj.class = 'org.flowable.engine.impl.bpmn.listener.ScriptTaskListener';
      break;
    case 'expressionListener':
      listenerObj.expression = options.expression;
      break;
    case 'delegateExpressionListener':
      listenerObj.delegateExpression = options.delegateExpression;
      break;
    default:
      listenerObj.class = options.class;
  }
  // 注入字段
  if (options.fields) {
    listenerObj.fields = options.fields.map((field: ANY_OBJECT) => {
      return createFieldObject(field, prefix);
    });
  }
  const win: ANY_OBJECT = window;
  if (!win.bpmnInstances) {
    console.error('window.bpmnInstances not found');
    return null;
  }
  // 任务监听器的 定时器 设置
  if (isTask && options.event === 'timeout' && !!options.eventDefinitionType) {
    const timeDefinition = win.bpmnInstances.moddle.create('bpmn:FormalExpression', {
      body: options.eventTimeDefinitions,
    });
    const TimerEventDefinition = win.bpmnInstances.moddle.create('bpmn:TimerEventDefinition', {
      id: `TimerEventDefinition_${uuid(8)}`,
      [`time${options.eventDefinitionType.replace(/^\S/, s => s.toUpperCase())}`]: timeDefinition,
    });
    listenerObj.eventDefinitions = [TimerEventDefinition];
  }
  return win.bpmnInstances.moddle.create(
    `${prefix}:${isTask ? 'TaskListener' : 'ExecutionListener'}`,
    listenerObj,
  );
}

// 创建 监听器的注入字段 实例
export function createFieldObject(option: ANY_OBJECT, prefix: string) {
  const win: ANY_OBJECT = window;
  if (!win.bpmnInstances) {
    console.error('window.bpmnInstances not found');
    return null;
  }
  const { name, fieldType, string, expression } = option;
  const fieldConfig = fieldType === 'string' ? { name, string } : { name, expression };
  return win.bpmnInstances.moddle.create(`${prefix}:Field`, fieldConfig);
}

// 创建脚本实例
export function createScriptObject(options: ANY_OBJECT, prefix: string) {
  const win: ANY_OBJECT = window;
  if (!win.bpmnInstances) {
    console.error('window.bpmnInstances not found');
    return null;
  }
  const { scriptType, scriptFormat, value, resource } = options;
  const scriptConfig =
    scriptType === 'inlineScript' ? { scriptFormat, value } : { scriptFormat, resource };
  return win.bpmnInstances.moddle.create(`${prefix}:Script`, scriptConfig);
}

// 更新元素扩展属性
export function updateElementExtensions(element: ANY_OBJECT, extensionList: ANY_OBJECT[]) {
  const win: ANY_OBJECT = window;
  if (!win.bpmnInstances) {
    console.error('window.bpmnInstances not found');
    return;
  }
  const extensions = win.bpmnInstances.moddle.create('bpmn:ExtensionElements', {
    values: extensionList,
  });
  win.bpmnInstances.modeling.updateProperties(element, {
    extensionElements: extensions,
  });
}

// 创建一个id
export function uuid(length = 8, chars: string | null = null) {
  let result = '';
  const charsString = chars || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = length; i > 0; --i) {
    result += charsString[Math.floor(Math.random() * charsString.length)];
  }
  return result;
}
