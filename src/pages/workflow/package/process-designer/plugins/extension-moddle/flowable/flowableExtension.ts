import { ANY_OBJECT } from '@/types/generic';
import { some } from 'min-dash';

const ALLOWED_TYPES: ANY_OBJECT = {
  FailedJobRetryTimeCycle: [
    'bpmn:StartEvent',
    'bpmn:BoundaryEvent',
    'bpmn:IntermediateCatchEvent',
    'bpmn:Activity',
  ],
  Connector: ['bpmn:EndEvent', 'bpmn:IntermediateThrowEvent'],
  Field: ['bpmn:EndEvent', 'bpmn:IntermediateThrowEvent'],
};

function is(element: ANY_OBJECT, type: string) {
  return element && typeof element.$instanceOf === 'function' && element.$instanceOf(type);
}

function exists(element: ANY_OBJECT[]) {
  return element && element.length;
}

function includesType(collection: ANY_OBJECT[], type: string) {
  return (
    exists(collection) &&
    some(collection, function (element: ANY_OBJECT) {
      return is(element, type);
    })
  );
}

function anyType(element: ANY_OBJECT, types: string[]) {
  return some(types, function (type: string) {
    return is(element, type);
  });
}

function isAllowed(propName: string, propDescriptor: ANY_OBJECT, newElement: ANY_OBJECT) {
  var name = propDescriptor.name,
    types = ALLOWED_TYPES[name.replace(/flowable:/, '')];

  return name === propName && anyType(newElement, types);
}

class FlowableModdleExtension {
  // 定义属性
  $inject = ['eventBus'];

  // 定义构造函数：为了将来实例化对象的时候，可以直接对属性的值进行初始化
  constructor(eventBus: ANY_OBJECT) {
    eventBus.on('property.clone', (context: ANY_OBJECT) => {
      var newElement = context.newElement,
        propDescriptor = context.propertyDescriptor;

      this.canCloneProperty(newElement, propDescriptor);
    });
  }

  canCloneProperty(newElement: ANY_OBJECT, propDescriptor: ANY_OBJECT) {
    if (isAllowed('flowable:FailedJobRetryTimeCycle', propDescriptor, newElement)) {
      return (
        includesType(newElement.eventDefinitions, 'bpmn:TimerEventDefinition') ||
        includesType(newElement.eventDefinitions, 'bpmn:SignalEventDefinition') ||
        is(newElement.loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')
      );
    }

    if (isAllowed('flowable:Connector', propDescriptor, newElement)) {
      return includesType(newElement.eventDefinitions, 'bpmn:MessageEventDefinition');
    }

    if (isAllowed('flowable:Field', propDescriptor, newElement)) {
      return includesType(newElement.eventDefinitions, 'bpmn:MessageEventDefinition');
    }
  }
}

export default FlowableModdleExtension;
