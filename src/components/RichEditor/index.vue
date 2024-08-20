<template>
  <div style="border: 1px solid #ccc">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      style="overflow-y: hidden"
      :style="{ height: height }"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
    />
  </div>
</template>

<script lang="ts">
// TODO 须测试
import '@wangeditor/editor/dist/css/style.css'; // 引入 css
import { IEditorConfig, IToolbarConfig } from '@wangeditor/editor';
const defaultEditorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      // 小于该值就插入 base64 格式（而不上传），默认为 0
      base64LimitSize: 1024 * 1024, // 5kb
    },
  },
};
const defaultToolbarConfig: Partial<IToolbarConfig> = {
  toolbarKeys: [
    'headerSelect',
    // '|',
    // 'header1',
    // 'header2',
    // 'header3',
    // 'header4',
    // 'header5',
    'bold',
    'underline',
    'italic',
    'through',
    // 'code',
    // 'sub',
    // 'sup',
    // 'clearStyle',
    'color',
    'bgColor',
    'fontSize',
    'fontFamily',
    'indent',
    'delIndent',
    // 'justifyLeft',
    // 'justifyRight',
    // 'justifyCenter',
    // 'justifyJustify',
    'lineHeight',
    'insertImage',
    'uploadImage',
    // 'deleteImage',
    // 'editImage',
    // 'viewImageLink',
    // 'imageWidth30',
    // 'imageWidth50',
    // 'imageWidth100',
    'divider',
    // 'emotion',
    'insertLink',
    'editLink',
    'unLink',
    'viewLink',
    'codeBlock',
    'blockquote',
    'todo',
    'redo',
    'undo',
    'fullScreen',
    // 'enter',
    // 'bulletedList',
    // 'numberedList',
    // 'insertTable',
    // 'deleteTable',
    // 'insertTableRow',
    // 'deleteTableRow',
    // 'insertTableCol',
    // 'deleteTableCol',
    // 'tableHeader',
    // 'tableFullWidth',
    // 'insertVideo',
    // 'uploadVideo',
    // 'editVideoSize',
    // 'uploadImage',
    // 'codeSelectLang',
  ],
};
</script>

<script setup lang="ts">
import { onBeforeUnmount, shallowRef } from 'vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { ANY_OBJECT } from '@/types/generic';

const emit = defineEmits<{ 'update:value': [string | undefined] }>();

const props = withDefaults(
  defineProps<{
    value?: string;
    editorConfig?: ANY_OBJECT;
    toolbarConfig?: ANY_OBJECT;
    height?: string;
  }>(),
  {
    editorConfig: () => {
      return defaultEditorConfig;
    },
    toolbarConfig: () => {
      return defaultToolbarConfig;
    },
    height: '300px',
  },
);

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();
const mode = ref('default');

// 内容 HTML
const valueHtml = computed({
  get() {
    return props.value;
  },
  set(val) {
    console.log('richeditor value input', val);
    emit('update:value', val);
  },
});

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

const handleCreated = (editor: ANY_OBJECT) => {
  editorRef.value = editor; // 记录 editor 实例，重要！

  console.log('editor', editor);
  console.log(editor.getAllMenuKeys());
};

watch(
  () => props.value,
  newValue => {
    if (editorRef.value) editorRef.value.txt.html(newValue);
  },
  {
    deep: true,
    immediate: true,
  },
);

const getHtml = () => {
  return editorRef.value ? editorRef.value.txt.html() : undefined;
};

defineExpose({ getHtml });
</script>
