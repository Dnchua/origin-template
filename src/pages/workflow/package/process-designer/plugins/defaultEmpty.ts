import { ANY_OBJECT } from '@/types/generic';
import { uuid } from '../../utils';
export default (key: string, name: string, type: string, diagramType: number): string => {
  if (!type) type = 'camunda';
  const TYPE_TARGET: ANY_OBJECT = {
    activiti: 'http://activiti.org/bpmn',
    camunda: 'http://bpmn.io/schema/bpmn',
    flowable: 'http://flowable.org/bpmn',
  };
  const startId = uuid();
  const endId = uuid();
  const lineId1 = uuid();
  const lineId2 = uuid();
  const userTaskId = uuid();

  const processXml =
    diagramType === 1
      ? `
    <bpmn2:startEvent id="Event_${startId}">
      <bpmn2:outgoing>Flow_${lineId1}</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:userTask id="Activity_${userTaskId}">
      <bpmn2:incoming>Flow_${lineId1}</bpmn2:incoming>
      <bpmn2:outgoing>Flow_${lineId2}</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="Flow_${lineId1}" sourceRef="Event_${startId}" targetRef="Activity_${userTaskId}" />
    <bpmn2:endEvent id="Event_${endId}">
      <bpmn2:incoming>Flow_${lineId2}</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="Flow_${lineId2}" sourceRef="Activity_${userTaskId}" targetRef="Event_${endId}" />
  `
      : '';
  const BPMNPlaneXml =
    diagramType === 1
      ? `
    <bpmndi:BPMNEdge id="Flow_${lineId1}_di" bpmnElement="Flow_${lineId1}">
      <di:waypoint x="86" y="68" />
      <di:waypoint x="140" y="68" />
    </bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_${lineId2}_di" bpmnElement="Flow_${lineId2}">
      <di:waypoint x="240" y="68" />
      <di:waypoint x="302" y="68" />
    </bpmndi:BPMNEdge>
    <bpmndi:BPMNShape id="Event_${startId}_di" bpmnElement="Event_${startId}">
      <dc:Bounds x="50" y="50" width="36" height="36" />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Activity_${userTaskId}_di" bpmnElement="Activity_${userTaskId}">
      <dc:Bounds x="140" y="28" width="100" height="80" />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Event_${endId}_di" bpmnElement="Event_${endId}">
      <dc:Bounds x="302" y="50" width="36" height="36" />
    </bpmndi:BPMNShape>
  `
      : '';

  return `
    <?xml version="1.0" encoding="UTF-8"?>
    <bpmn2:definitions
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
      xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
      xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
      xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
      xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd"
      id="diagram_${key}"
      targetNamespace="${TYPE_TARGET[type]}">
      <bpmn2:process id="${key}" name="${name}" isExecutable="true">
        ${processXml}
      </bpmn2:process>
      <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${key}">
          ${BPMNPlaneXml}
        </bpmndi:BPMNPlane>
      </bpmndi:BPMNDiagram>
    </bpmn2:definitions>
  `;
};
