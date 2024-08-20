<template>
  <el-row :justify="align">
    <img :src="imageUrl" :style="getStyle" />
  </el-row>
</template>

<script setup lang="ts">
import { EpPropMergeType } from 'element-plus/es/utils';
import { ANY_OBJECT } from '@/types/generic';
import { useUpload } from '@/common/hooks/useUpload';
import { API_CONTEXT } from '@/api/config';

const props = withDefaults(
  defineProps<{
    widget: ANY_OBJECT | null;
    value?: string;
    src?: string;
    fit?: string;
    align?:
      | EpPropMergeType<
          StringConstructor,
          'center' | 'space-around' | 'space-between' | 'space-evenly' | 'end' | 'start',
          unknown
        >
      | undefined;
    width?: string;
    height?: string;
    radius?: number;
    round?: boolean;
  }>(),
  {
    align: 'start',
    radius: 5,
    round: false,
  },
);

const { parseUploadData, getUploadFileUrl } = useUpload();
const form = inject('form', () => {
  console.error('OnlineCustomImage: form not injected');
  return { isEdit: false } as ANY_OBJECT;
});

const fileList = ref<ANY_OBJECT[]>([]);

const getStyle = computed<ANY_OBJECT>(() => {
  let temp = props.round ? '50%' : props.radius + 'px';
  return {
    width: props.width != null ? props.width : '200px',
    height: props.height != null ? props.height : '200px',
    'object-fit': props.fit,
    'border-radius': temp,
  };
});
const buildFlowParam = computed(() => {
  let flowParam: ANY_OBJECT = {};
  let flowData = form().flowData;
  if (flowData) {
    if (flowData.processDefinitionKey)
      flowParam.processDefinitionKey = flowData.processDefinitionKey;
    if (flowData.processInstanceId) flowParam.processInstanceId = flowData.processInstanceId;
    if (flowData.taskId) flowParam.taskId = flowData.taskId;
  }

  return flowParam;
});
const imageUrl = computed(() => {
  console.log('imageUrl', fileList, props.src);
  if (Array.isArray(fileList.value) && fileList.value.length > 0) {
    return fileList.value[0].url;
  } else {
    return isBase64(props.src) ? props.src : getDownloadUrl.value;
  }
});
const getDownloadUrl = computed(() => {
  if (props.value) {
    //console.log('getDownloadUrl 1', props);
    if (props.widget?.relation) {
      return (
        'admin/online/onlineOperation/downloadOneToManyRelation/' +
        (props.widget.datasource || {}).variableName
      );
    } else {
      return (
        'admin/online/onlineOperation/downloadDatasource/' +
        (props.widget?.datasource || {}).variableName
      );
    }
  } else {
    let imgUrl;
    try {
      imgUrl = props.src ? JSON.parse(props.src) : undefined;
      if (imgUrl) {
        imgUrl = getUploadFileUrl(imgUrl, { filename: imgUrl.filename });
      }
    } catch (e) {
      console.warn(e);
      imgUrl = null;
    }
    //console.log('getDownloadUrl 2', imgUrl);
    return imgUrl;
  }
});

watch(
  () => props.value,
  (newValue: string | undefined) => {
    console.log('CustomImage.value change', newValue);
    setTimeout(() => {
      fileList.value = [];
      if (newValue) {
        let downloadParams: ANY_OBJECT = {
          ...buildFlowParam.value,
          datasourceId: (props.widget?.datasource || {}).datasourceId,
          fieldName: props.widget?.column?.columnName,
          asImage: true,
          dataId: form().getPrimaryData(props.widget) || '',
        };
        if (props.widget?.relation) downloadParams.relationId = props.widget.relation.relationId;
        let temp = JSON.parse(newValue);
        temp = Array.isArray(temp)
          ? temp.map(item => {
              return {
                ...item,
                downloadUri: getDownloadUrl.value,
              };
            })
          : [];
        fileList.value = parseUploadData(JSON.stringify(temp), downloadParams);
      }
    }, 30);
  },
  {
    deep: true,
    immediate: true,
  },
);

function isBase64(src: string | undefined) {
  return src && /^data:image\/\w+;base64,/.test(src);
}
</script>
