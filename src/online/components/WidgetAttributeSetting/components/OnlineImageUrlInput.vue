<template>
  <div>
    <el-input :value="value" :size="size" :disabled="disabled">
      <template #append>
        <el-button :icon="Upload" @click="onSelect" :disabled="disabled"> </el-button>
      </template>
    </el-input>
    <input
      type="file"
      ref="fileSelect"
      v-show="false"
      accept="image/*"
      @change.stop="onSelectImageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { Upload } from '@element-plus/icons-vue';
import { useUpload } from '@/common/hooks/useUpload';
import { API_CONTEXT } from '@/api/config';

const { getUploadActionUrl, fetchUpload } = useUpload();

withDefaults(
  defineProps<{
    value: string;
    size?: '' | 'default' | 'small' | 'large';
    disabled?: boolean;
  }>(),
  {
    size: 'small',
    disabled: false,
  },
);

const fileSelect = ref();

const onSelect = () => {
  fileSelect.value.click();
};
const onSelectImageChange = (e: Event) => {
  const el = e.target as HTMLInputElement;
  if (el && el.files) {
    console.log('files', el.files);
    let file = el.files[0];
    if (file != null) {
      let uploadUrl = getUploadActionUrl(API_CONTEXT + '/commonext/util/uploadImage');
      fetchUpload(uploadUrl, {
        uploadFile: file,
      })
        .then(res => {
          //console.log('upload file', res);
          onValueChange(JSON.stringify(res));
        })
        .catch((e: Error) => {
          console.warn(e);
        });
    }
  }
};

const emit = defineEmits<{ 'update:value': [string] }>();
const onValueChange = (val: string) => {
  //console.log('image url change', val);
  emit('update:value', val);
};
</script>
