<template>
  <div class="panel-tab__content" style="padding-top: 3px">
    <ConyForSelect v-model:value="copyForItemList" />
  </div>
</template>

<script setup lang="ts">
import { SysCommonBizController } from '@/api/system';
import { SysFlowCopyForType } from '@/common/staticDict/flow';
import ConyForSelect from '@/pages/workflow/components/CopyForSelect/copyForSetting.vue';
import { ANY_OBJECT } from '@/types/generic';

const props = defineProps<{ id: string; type: string }>();
const prefix = inject('prefix');

const copyForItemList = ref<ANY_OBJECT[]>([]);
let copyItemElementList: ANY_OBJECT | undefined = undefined;
const win: ANY_OBJECT = window;
let bpmnELement: ANY_OBJECT | null = null;

const resetFormVariable = async () => {
  bpmnELement = win.bpmnInstances.bpmnElement;
  let elExtensionElements =
    bpmnELement?.businessObject.get('extensionElements') ||
    win.bpmnInstances.moddle.create('bpmn:ExtensionElements', { values: [] });
  copyItemElementList =
    elExtensionElements.values.filter(
      (ex: ANY_OBJECT) => ex.$type === `${prefix}:CopyItemList`,
    )?.[0] || win.bpmnInstances.moddle.create(`${prefix}:CopyItemList`, { copyItemList: [] });
  let itemList = [];
  if (copyItemElementList && copyItemElementList.copyItemList) {
    for (let i = 0; i < copyItemElementList.copyItemList.length; i++) {
      const item = copyItemElementList.copyItemList[i];
      if (item.type === SysFlowCopyForType.USER) {
        let params = {
          widgetType: 'upms_user',
          fieldName: 'loginName',
          fieldValues: item.id,
        };
        let userNames = item.id.split(',');

        params.fieldValues = params.fieldValues
          .split(',')
          .filter((row: string) => {
            return ['${startUserName}', '${appointedAssignee}'].indexOf(row) === -1;
          })
          .join(',');

        let loginNames = item.id.split(',');
        if (params.fieldValues) {
          const res = await SysCommonBizController.viewByIds(params);
          // eslint-disable-next-line no-case-declarations
          res.data.forEach(item => {
            userNames[loginNames.indexOf(item.loginName)] = item.showName;
          });
        }

        itemList.push({
          ...item,
          userName: loginNames.map((row: string, i: number) => {
            return {
              id: row,
              name: userNames[i],
            };
          }),
        });
      } else {
        itemList.push(item);
      }
    }
  }
  copyForItemList.value = itemList;
  updateElementExtensions();
};
const updateElementExtensions = () => {
  // 更新回扩展元素
  let elExtensionElements =
    bpmnELement?.businessObject.get('extensionElements') ||
    win.bpmnInstances.moddle.create('bpmn:ExtensionElements', { values: [] });
  let otherExtensions = elExtensionElements.values.filter(
    (ex: ANY_OBJECT) => ex.$type !== `${prefix}:CopyItemList`,
  );
  if (copyItemElementList) {
    copyItemElementList.copyItemList = (copyForItemList.value || []).map(item => {
      return win.bpmnInstances.moddle.create(`${prefix}:CopyItem`, {
        id: item.id,
        type: item.type,
      });
    });
  }
  const newElExtensionElements = win.bpmnInstances.moddle.create(`bpmn:ExtensionElements`, {
    values: otherExtensions.concat(copyItemElementList),
  });
  // 更新到元素上
  win.bpmnInstances.modeling.updateProperties(bpmnELement, {
    extensionElements: newElExtensionElements,
  });
};

watch(
  () => props.id,
  val => {
    if (val && val.length) {
      nextTick(() => {
        resetFormVariable();
      });
    }
  },
  {
    immediate: true,
  },
);
watch(copyForItemList, () => {
  updateElementExtensions();
});
</script>
