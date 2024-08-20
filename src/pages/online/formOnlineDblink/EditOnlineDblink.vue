<template>
  <el-container class="edit-online-dblink">
    <el-header
      class="step-header"
      style="overflow: hidden; height: 72px; background: white; border-bottom: 1px solid #ebeef5"
    >
      <el-row type="flex" justify="space-between" align="middle" style="height: 100%">
        <div class="title" style="display: flex; width: 200px; height: 40px; line-height: 40px">
          <i class="header-logo logo online-icon icon-orange-icon" style="font-size: 40px" />
          <span style="font-size: 22px; color: #333; font-weight: bold">数据库链接</span>
        </div>
        <el-row type="flex" justify="end">
          <el-button :size="formItemSize" type="primary" @click="onSaveClick"> 保存 </el-button>
          <el-button
            :size="formItemSize"
            type="success"
            :disabled="formData.onlineDblink.dblinkId == null"
            @click="() => onTestConnect(true).catch(e => {})"
          >
            测试链接
          </el-button>
          <el-button :size="formItemSize" @click="onCancelClick">退出</el-button>
        </el-row>
      </el-row>
    </el-header>
    <el-main style="padding: 15px; background-color: #f9f9f9">
      <el-row type="flex" justify="center" style="height: 100%">
        <el-scrollbar style="height: calc(100vh - 90px)" class="custom-scroll edit-box">
          <el-form
            ref="form"
            :model="formData"
            class="full-width-input"
            :rules="rules"
            style="width: 100%; padding: 20px"
            label-width="110px"
            :size="formItemSize"
            label-position="right"
            @submit.prevent
          >
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="类型" prop="onlineDblink.dblinkType">
                  <el-select
                    class="input-item"
                    v-model="formData.onlineDblink.dblinkType"
                    :clearable="true"
                    filterable
                    placeholder="数据源类型"
                  >
                    <el-option
                      v-for="item in getValidDblinkType"
                      :key="item.id"
                      :value="item.id"
                      :label="item.name"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="名称" prop="onlineDblink.dblinkName">
                  <el-input
                    class="input-item"
                    v-model="formData.onlineDblink.dblinkName"
                    :clearable="true"
                    placeholder="数据源名称"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="描述" prop="onlineDblink.dblinkDescription">
                  <el-input
                    class="input-item"
                    v-model="formData.onlineDblink.dblinkDescription"
                    :clearable="true"
                    placeholder="数据源描述"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="formData.onlineDblink.dblinkType != null">
                <el-form-item label="服务器地址" prop="onlineDblink.configuration.host">
                  <el-input
                    class="input-item"
                    v-model="formData.onlineDblink.configuration.host"
                    :clearable="true"
                    placeholder="服务器地址"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="formData.onlineDblink.dblinkType != null">
                <el-form-item label="端口号" prop="onlineDblink.configuration.port">
                  <el-input-number
                    class="input-item"
                    v-model="formData.onlineDblink.configuration.port"
                    :controls="false"
                    :clearable="true"
                    placeholder="端口号"
                  />
                </el-form-item>
              </el-col>
              <el-col
                :span="24"
                v-if="
                  formData.onlineDblink.dblinkType != null &&
                  formData.onlineDblink.dblinkType !== DblinkType.ORACLE
                "
              >
                <el-form-item label="数据库名" prop="onlineDblink.configuration.database">
                  <el-input
                    class="input-item"
                    v-model="formData.onlineDblink.configuration.database"
                    :clearable="true"
                    placeholder="数据库名称"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="formData.onlineDblink.dblinkType != null">
                <el-form-item label="用户名" prop="onlineDblink.configuration.username">
                  <el-input
                    class="input-item"
                    v-model="formData.onlineDblink.configuration.username"
                    :clearable="true"
                    placeholder="用户名"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="formData.onlineDblink.dblinkType != null">
                <el-form-item label="密码" prop="onlineDblink.configuration.password">
                  <el-input
                    class="input-item"
                    v-model="formData.onlineDblink.configuration.password"
                    :clearable="true"
                    placeholder="密码"
                  />
                </el-form-item>
              </el-col>
              <el-col
                :span="24"
                v-if="
                  formData.onlineDblink.dblinkType === DblinkType.MYSQL ||
                  formData.onlineDblink.dblinkType === DblinkType.POSTGRESQL ||
                  formData.onlineDblink.dblinkType === DblinkType.OPENGAUSS
                "
              >
                <el-form-item label="JDBC额外参数" prop="onlineDblink.configuration.jdbcString">
                  <el-input
                    class="input-item"
                    v-model="formData.onlineDblink.configuration.jdbcString"
                    :clearable="true"
                    placeholder="JDBC额外参数"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="formData.onlineDblink.dblinkType === DblinkType.ORACLE">
                <el-form-item label="服务名 / SID" prop="onlineDblink.configuration.sid">
                  <el-radio-group v-model="formData.onlineDblink.configuration.sid">
                    <el-radio :value="true">SID</el-radio>
                    <el-radio :value="false">服务名</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="24" v-if="formData.onlineDblink.dblinkType === DblinkType.ORACLE">
                <el-form-item label="服务名 / SID" prop="onlineDblink.configuration.serviceId">
                  <el-input
                    class="input-item"
                    v-model="formData.onlineDblink.configuration.serviceId"
                    :clearable="true"
                    placeholder="服务名 / SID"
                  />
                </el-form-item>
              </el-col>
              <el-col
                :span="24"
                v-if="
                  formData.onlineDblink.dblinkType === DblinkType.POSTGRESQL ||
                  formData.onlineDblink.dblinkType === DblinkType.OPENGAUSS
                "
              >
                <el-form-item label="数据库 Schema" prop="onlineDblink.configuration.schema">
                  <el-input
                    class="input-item"
                    v-model="formData.onlineDblink.configuration.schema"
                    :clearable="true"
                    placeholder="数据库 Schema"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-divider>高级设置</el-divider>
              </el-col>
              <el-col :span="24">
                <el-form-item label="初始连接数" prop="onlineDblink.configuration.initialPoolSize">
                  <el-input-number
                    class="input-item"
                    v-model="formData.onlineDblink.configuration.initialPoolSize"
                    :controls="false"
                    :clearable="true"
                    placeholder="初始连接数"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="最小连接数" prop="onlineDblink.configuration.minPoolSize">
                  <el-input-number
                    class="input-item"
                    v-model="formData.onlineDblink.configuration.minPoolSize"
                    :controls="false"
                    :clearable="true"
                    placeholder="最小连接数"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="最大连接数" prop="onlineDblink.configuration.maxPoolSize">
                  <el-input-number
                    class="input-item"
                    v-model="formData.onlineDblink.configuration.maxPoolSize"
                    :controls="false"
                    :clearable="true"
                    placeholder="最大连接数"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-scrollbar>
      </el-row>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, reactive } from 'vue';
import { DialogProp } from '@/components/Dialog/types';
import { OnlineDblinkController } from '@/api/online';
import { DblinkType } from '@/common/staticDict';
import { DBLink } from '@/types/online/dblink';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

interface IProps extends ThirdProps {
  dblink?: DBLink;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<boolean>;
}
const props = defineProps<IProps>();
const { thirdParams, onCloseThirdDialog } = useThirdParty(props);
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize || thirdParams.value.defaultFormItemSize?.value;
});

const defaultDBLink = {
  configuration: { sid: true, initialPoolSize: 5, minPoolSize: 5, maxPoolSize: 50 },
  isDatasourceInit: false,
} as DBLink;

const form = ref();
const formData = reactive({ onlineDblink: defaultDBLink });

const rules = {
  'onlineDblink.dblinkName': [{ required: true, message: '请输入名称', trigger: 'blur' }],
  'onlineDblink.configuration.host': [
    { required: true, message: '请输入服务器地址', trigger: 'blur' },
  ],
  'onlineDblink.configuration.database': [
    { required: true, message: '请输入数据库名称', trigger: 'blur' },
  ],
  'onlineDblink.configuration.username': [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  'onlineDblink.configuration.password': [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
  'onlineDblink.configuration.port': [{ required: true, message: '请输入端口号', trigger: 'blur' }],
  'onlineDblink.configuration.initialPoolSize': [
    { required: true, message: '请输入初始连接数', trigger: 'blur' },
  ],
  'onlineDblink.configuration.minPoolSize': [
    { required: true, message: '请输入最小连接数', trigger: 'blur' },
  ],
  'onlineDblink.configuration.maxPoolSize': [
    { required: true, message: '请输入最大连接数', trigger: 'blur' },
  ],
  'onlineDblink.dblinkType': [{ required: true, message: '请输入类型', trigger: 'blur' }],
  'onlineDblink.configuration.serviceId': [
    { required: true, message: '请输入服务名 / SID', trigger: 'blur' },
  ],
};

const dialogParams = computed(() => {
  return {
    // 第三方参数
    dblink: props.dblink || thirdParams.value.dblink,
  };
});
const getValidDblinkType = computed(() => {
  return DblinkType.getList().filter(item => {
    return item.id !== DblinkType.CLICK_HOUS && item.id !== DblinkType.DORIS;
  });
});

const onCancelClick = () => {
  if (props.dialog) {
    props.dialog.cancel();
  } else {
    // 关闭第三方弹窗
    onCloseThirdDialog(false);
  }
};

const onTestConnect = (showMsg = false) => {
  return new Promise((resolve, reject) => {
    OnlineDblinkController.testConnection({
      dblinkId: formData.onlineDblink.dblinkId,
    })
      .then(res => {
        if (showMsg) ElMessage.success('连接成功！');
        resolve(res);
      })
      .catch(e => {
        reject(e);
      });
  });
};

/**
 * 获取数据库链接详细信息
 */
const loadOnlineDblinkData = () => {
  if (dialogParams.value.dblink == null) {
    return;
  }
  let params = {
    dblinkId: dialogParams.value.dblink.dblinkId,
  };
  OnlineDblinkController.view(params)
    .then(res => {
      res.data.configuration = JSON.parse(res.data.configuration);
      formData.onlineDblink = { ...res.data, isDatasourceInit: true };
    })
    .catch(e => {
      console.warn(e);
    });
};

/**
 * 保存
 */
const onSaveClick = () => {
  form.value.validate((valid: boolean) => {
    if (!valid) return;
    let params = {
      onlineDblinkDto: {
        dblinkId: (dialogParams.value.dblink || {}).dblinkId,
        dblinkName: formData.onlineDblink.dblinkName,
        dblinkDescription: formData.onlineDblink.dblinkDescription,
        dblinkType: formData.onlineDblink.dblinkType,
        configuration: JSON.stringify(formData.onlineDblink.configuration),
      },
    };

    let httpCall = dialogParams.value.dblink
      ? OnlineDblinkController.update(params)
      : OnlineDblinkController.add(params);

    httpCall
      .then(res => {
        console.log('dblink saved', res);
        ElMessage.success('保存成功');
        if (dialogParams.value.dblink == null) formData.onlineDblink.dblinkId = res.data as string;
        return onTestConnect(false);
      })
      .then(() => {
        if (props.dialog) {
          props.dialog.submit(true);
        } else {
          onCloseThirdDialog(true);
        }
      })
      .catch(e => {
        console.warn(e);
      });
  });
};

const reset = () => {
  formData.onlineDblink = defaultDBLink;
};

watch(
  () => dialogParams.value.dblink,
  newValue => {
    if (newValue == null) {
      reset();
    } else {
      loadOnlineDblinkData();
    }
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>

<style scoped>
.edit-online-dblink {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100vw;
  height: 100vh;
  background: #f9f9f9;
}
.edit-box {
  width: 600px;
  height: 100%;
  padding: 20px;
  background: white;
}
</style>
