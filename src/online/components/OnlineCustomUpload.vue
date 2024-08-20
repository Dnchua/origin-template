<template>
  <div class="online-custom-upload">
    <el-upload
      v-if="!readOnly"
      :class="{
        'upload-image-item': isImage,
        'upload-image-multi': maxFileCount !== 1,
      }"
      :name="widget.props.fileFieldName"
      :headers="getUploadHeaders"
      :action="getActionUrl"
      :data="uploadData"
      :on-success="onUploadSuccess"
      :on-remove="onRemoveFile"
      :on-error="onUploadError"
      :on-exceed="onUploadLimit"
      :limit="maxFileCount"
      :show-file-list="maxFileCount !== 1 || !isImage"
      :list-type="getUploadListType"
      :file-list="getUploadFileList"
      :disabled="getDisabledStatus()"
    >
      <!-- 上传图片 -->
      <template v-if="isImage && maxFileCount === 1">
        <div v-if="getUploadFileList && getUploadFileList[0] != null" style="position: relative">
          <img class="upload-image-show" :src="getUploadFileList[0].url" />
          <el-icon class="upload-img-del" @click.stop="onRemoveFile(null, null)"><Close /></el-icon>
        </div>
        <el-icon v-else class="upload-image-item"><Plus /></el-icon>
      </template>
      <!-- 上传文件 -->
      <template v-else-if="!isImage">
        <el-button :size="layoutStore.defaultFormItemSize" type="primary">点击上传</el-button>
      </template>
    </el-upload>
    <template v-else>
      <template v-if="isImage">
        <el-image
          v-for="item in uploadWidgetImpl.fileList"
          :preview-src-list="(uploadWidgetImpl.fileList || []).map((imgItem:ANY_OBJECT) => imgItem.url)"
          class="table-cell-image"
          :key="item.url"
          :src="item.url"
          fit="fill"
        >
        </el-image>
      </template>
      <a
        v-else
        v-for="item in uploadWidgetImpl.fileList"
        :key="item.url"
        href="javascript:void(0);"
        @click="item.url && downloadFile(item.url, item.name)"
      >
        {{ item.name }}
      </a>
    </template>
  </div>
</template>

<script setup lang="ts">
import { UploadFile, ElMessage } from 'element-plus';
import { Plus, Close } from '@element-plus/icons-vue';
import { useDownload } from '@/common/hooks/useDownload';
import { useUpload } from '@/common/hooks/useUpload';
import { useUploadWidget } from '@/common/hooks/useUploadWidget';
import { OnlineFormEventType } from '@/common/staticDict';
import { ANY_OBJECT } from '@/types/generic';
import { SysOnlineFieldKind } from '@/common/staticDict/online';
import { API_CONTEXT } from '@/api/config';

const emit = defineEmits<{
  'update:value': [string | undefined];
  'update:modelValue': [string | undefined];
}>();

const props = withDefaults(
  defineProps<{ value?: string; widget: ANY_OBJECT; readOnly?: boolean }>(),
  {
    readOnly: false,
  },
);

console.log('OnlineCustomUpload props ', props);

const form = inject('form', () => {
  console.error('OnlineCustomUpload: form not injected');
  return { isEdit: false } as ANY_OBJECT;
});
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

const { downloadFile } = useDownload();
const { getUploadHeaders, getUploadActionUrl, parseUploadData, fileListToJson } = useUpload();

const maxFileCount = computed(() => {
  console.log('maxFileCount < column', props.widget.column);
  return props.widget.column ? props.widget.column.maxFileCount : 1;
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
const getActionUrl = computed(() => {
  if (props.widget.props.actionUrl == null || props.widget.props.actionUrl === '') {
    if (props.widget.relation) {
      return getUploadActionUrl(
        API_CONTEXT +
          '/online/onlineOperation/uploadOneToManyRelation/' +
          (props.widget.datasource || {}).variableName,
      );
    } else {
      return getUploadActionUrl(
        API_CONTEXT +
          '/online/onlineOperation/uploadDatasource/' +
          (props.widget.datasource || {}).variableName,
      );
    }
  } else {
    return getUploadActionUrl(props.widget.props.actionUrl);
  }
});
const getDownloadUrl = computed(() => {
  if (props.widget.props.downloadUrl == null || props.widget.props.downloadUrl === '') {
    if (props.widget.relation) {
      return (
        API_CONTEXT +
        '/online/onlineOperation/downloadOneToManyRelation/' +
        (props.widget.datasource || {}).variableName
      );
    } else {
      return (
        API_CONTEXT +
        '/online/onlineOperation/downloadDatasource/' +
        (props.widget.datasource || {}).variableName
      );
    }
  } else {
    return props.widget.props.downloadUrl;
  }
});

const uploadData = ref<ANY_OBJECT>({});
// const getUploadData = computed(() => {
//   //console.log('getUploadData 2', uploadData.value);
//   return uploadData.value;
// });
const getUploadListType = computed(() => {
  if (maxFileCount.value !== 1 && isImage.value) {
    return 'picture-card';
  }
  return 'text';
});
const getUploadFileList = computed(() => {
  return uploadWidgetImpl ? uploadWidgetImpl.fileList : [];
});

const isImage = ref(false);
const uploadWidgetImpl = reactive(
  useUploadWidget(props.widget.column ? props.widget.column.maxFileCount : 0),
);

const getDisabledStatus = () => {
  if (form().isEdit) return true;
  const formWidgetAuth: ANY_OBJECT | null =
    form().formAuth && form().formAuth() && form().formAuth().pc
      ? form().formAuth().pc[props.widget.variableName]
      : null;
  if (formWidgetAuth && formWidgetAuth.disabled) return true;
  return props.widget.props.disabled;
};

const onValueChange = () => {
  // TODO 没找到widgetConfig的定义
  const json = fileListToJson(uploadWidgetImpl.fileList);
  emit('update:value', json);
  emit('update:modelValue', json);
};
const onUploadSuccess = (response: ANY_OBJECT, file: UploadFile, fileList: UploadFile[]) => {
  if (response.success) {
    //file.filename = response.data.filename;
    if (file.raw) file.url = URL.createObjectURL(file.raw);
    uploadWidgetImpl.onFileChange(file, fileList);
    onValueChange();
  } else {
    ElMessage.error(response.message);
  }
};
const onRemoveFile = (file: UploadFile | null, fileList: UploadFile[] | null) => {
  uploadWidgetImpl.onFileChange(file, fileList);
  onValueChange();
};
const onUploadError = () => {
  ElMessage.error('文件上传失败');
};
const onUploadLimit = () => {
  if (maxFileCount.value != null && maxFileCount.value > 0) {
    ElMessage.error('已经超出最大上传个数限制');
  }
};

onMounted(() => {
  console.log('OnlineCustomUpload onMounted', props.widget, props.widget.column);
  //let widget = props.widget;
  //widget.widgetImpl = getCurrentInstance();
});

watch(
  () => props.widget,
  () => {
    setTimeout(() => {
      let column = props.widget.bindData?.column || props.widget.column;
      isImage.value = column ? column.fieldKind === SysOnlineFieldKind.UPLOAD_IMAGE : false;
      console.log('watch widget OnlineCustomUpload >>>>>>>>>>', column, isImage.value);

      let temp: ANY_OBJECT = {
        ...buildFlowParam.value,
        datasourceId: (props.widget.datasource || {}).datasourceId,
        asImage: isImage.value,
        fieldName: (props.widget.column || {}).columnName,
      };
      // console.log(
      //   'getUploadData',
      //   props.widget?.datasource ? { ...props.widget.datasource } : 'undddefined',
      //   temp,
      // );
      if ((props.widget.relation || {}).relationId)
        temp.relationId = (props.widget.relation || {}).relationId;
      let flowData = form().flowData;
      if (flowData && flowData.processDefinitionKey)
        temp.processDefinitionKey = flowData.processDefinitionKey;
      uploadData.value = temp;
    }, 30);
  },
  {
    deep: true,
    immediate: true,
  },
);

watch(
  () => props.value,
  newValue => {
    console.log('OnlineCustomUpload watch value', newValue);
    if (!newValue) return;
    setTimeout(() => {
      uploadWidgetImpl.fileList = [];
      if (newValue != null) {
        let downloadParams: ANY_OBJECT = {
          ...buildFlowParam.value,
          datasourceId: (props.widget.datasource || {}).datasourceId,
          fieldName: props.widget.column.columnName,
          asImage: isImage.value,
          dataId: form().getPrimaryData(props.widget) || '',
        };
        if (props.widget.relation) downloadParams.relationId = props.widget.relation.relationId;
        let temp = JSON.parse(newValue);
        temp = Array.isArray(temp)
          ? temp.map(item => {
              return {
                ...item,
                downloadUri: getDownloadUrl.value,
              };
            })
          : [];
        uploadWidgetImpl.fileList = parseUploadData(JSON.stringify(temp), downloadParams);
      }
    }, 30);
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>
