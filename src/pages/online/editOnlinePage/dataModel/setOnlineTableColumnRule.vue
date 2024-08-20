<template>
  <div class="form-single-fragment third-party-dlg" style="position: relative">
    <!-- 设置字段验证规则 -->
    <el-form
      v-if="!isCreateRule"
      class="full-width-input form-box"
      ref="form"
      :rules="rules"
      :model="formData"
      label-width="80px"
      :size="formItemSize"
      label-position="right"
      @submit.prevent
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="验证规则" prop="ruleId" key="ruleId">
            <el-row :gutter="3" justify="space-between" style="width: 100%">
              <el-col :span="20">
                <el-select
                  class="input-item"
                  v-model="formData.ruleId"
                  placeholder="选择验证规则"
                  clearable
                  :disabled="isEdit"
                  :loading="ruleListWidget.loading"
                  @visible-change="ruleListWidget.onVisibleChange"
                  @change="onRuleIdChange"
                >
                  <el-option
                    v-for="item in ruleListWidget.dropdownList"
                    :key="item.ruleId"
                    :value="item.ruleId"
                    :label="item.ruleName"
                  >
                    <el-row type="flex" justify="end" align="middle" class="rule-item">
                      <span style="width: 100%">{{ item.ruleName }}</span>
                      <el-button
                        v-if="!item.builtin"
                        link
                        :icon="Edit"
                        style="margin-left: 30px"
                        @click.stop="onEditRule(item)"
                      />
                      <el-button
                        v-if="!item.builtin"
                        link
                        :icon="CircleClose"
                        @click.stop="onDeleteRule(item)"
                      />
                    </el-row>
                  </el-option>
                </el-select>
              </el-col>
              <el-col :span="4">
                <el-button v-if="!isEdit" type="warning" @click="onCreateRuleClick"
                  >新建规则</el-button
                >
              </el-col>
            </el-row>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="错误信息" prop="message" key="message">
            <el-input v-model="formData.message" placeholder="输入校验错误信息" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="最小值">
            <el-input-number
              v-model="formData.min"
              placeholder="输入最小值"
              :disabled="!ruleInfo || ruleInfo.ruleType !== SysOnlineRuleType.RANGE"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="最大值">
            <el-input-number
              v-model="formData.max"
              placeholder="输入最大值"
              :disabled="!ruleInfo || ruleInfo.ruleType !== SysOnlineRuleType.RANGE"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!-- 新建验证规则 -->
    <el-form
      v-if="isCreateRule"
      class="full-width-input form-box"
      ref="ruleForm"
      :rules="rules"
      :model="ruleData"
      label-width="100px"
      :size="formItemSize"
      label-position="right"
      @submit.prevent
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="规则类型" prop="ruleType">
            <el-input :model-value="SysOnlineRuleType.getValue(ruleData.ruleType)" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="规则名称" prop="ruleName" key="ruleName">
            <el-input v-model="ruleData.ruleName" placeholder="规则名称" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="正则表达式" prop="pattern" key="pattern">
            <el-input type="textarea" v-model="ruleData.pattern" placeholder="规则正则表达式" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-row class="menu-box" type="flex" justify="end">
      <el-button :size="formItemSize" :plain="true" @click="onCancelClick">取消</el-button>
      <el-button type="primary" :size="formItemSize" @click="onSubmit">保存</el-button>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { Edit, CircleClose } from '@element-plus/icons-vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { ANY_OBJECT } from '@/types/generic';
import { SysOnlineRuleType } from '@/common/staticDict/online';
import { useDropdown } from '@/common/hooks/useDropdown';
import { DropdownOptions, ListData } from '@/common/types/list';
import { findItemFromList } from '@/common/utils';
import { OnlineColumnController, OnlineRuleController } from '@/api/online';
import { DialogProp } from '@/components/Dialog/types';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

interface IProps extends ThirdProps {
  column: ANY_OBJECT;
  columnRule?: ANY_OBJECT;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<ANY_OBJECT>;
}
const props = defineProps<IProps>();
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize || thirdParams.value.defaultFormItemSize?.value;
});

const { thirdParams, onCloseThirdDialog } = useThirdParty(props);

const form = ref();
const ruleForm = ref();

const isCreateRule = ref(false);
const isEditRule = ref(false);

const formData = ref<ANY_OBJECT>({
  ruleId: undefined,
  message: undefined,
  min: undefined,
  max: undefined,
});
const ruleData = ref<ANY_OBJECT>({
  ruleName: undefined,
  ruleType: SysOnlineRuleType.CUSTOM,
  pattern: undefined,
  builtin: false,
});

const rules = {
  ruleId: [{ required: true, message: '请选择验证规则', trigger: 'blur' }],
  message: [{ required: true, message: '请输入校验错误信息', trigger: 'blur' }],
  ruleName: [{ required: true, message: '规则名称不能为空', trigger: 'blur' }],
  pattern: [{ required: true, message: '正则表达式不能为空', trigger: 'blur' }],
};

const dialogParams = computed(() => {
  return {
    column: props.column || thirdParams.value.column,
    columnRule: props.columnRule || thirdParams.value.columnRule,
  };
});
const isEdit = computed(() => {
  return dialogParams.value.columnRule != null;
});
const ruleInfo = computed(() => {
  return findItemFromList(ruleListWidget.dropdownList, formData.value.ruleId, 'ruleId');
});

const loadRuleListDropdownList = (): Promise<ListData<ANY_OBJECT>> => {
  return new Promise((resolve, reject) => {
    let params = {
      columnId: dialogParams.value.column.columnId,
    };
    let httpCall = isEdit.value
      ? OnlineColumnController.listOnlineColumnRule(params)
      : OnlineColumnController.listNotInOnlineColumnRule(params);
    httpCall
      .then(res => {
        resolve({ dataList: res.data.dataList });
      })
      .catch(e => {
        reject(e);
      });
  });
};
const dropdownOptions: DropdownOptions<ANY_OBJECT> = {
  loadData: loadRuleListDropdownList,
};
const ruleListWidget = reactive(useDropdown(dropdownOptions));

const removeValidate = () => {
  ruleForm.value?.clearValidate();
  form.value?.clearValidate();
};
const onCancel = () => {
  if (props.dialog) {
    props.dialog.cancel();
  } else {
    onCloseThirdDialog(false);
  }
};
const onRuleIdChange = () => {
  formData.value.message = undefined;
};
const onCancelClick = () => {
  if (!isCreateRule.value) {
    onCancel();
  }
  isCreateRule.value = isEditRule.value = false;
  removeValidate();
};
const onCreateRuleClick = () => {
  isCreateRule.value = true;
  isEditRule.value = false;
  ruleData.value = {
    ruleName: undefined,
    pattern: undefined,
    ruleType: SysOnlineRuleType.CUSTOM,
    builtin: false,
  };
  removeValidate();
};
const onEditRule = (rule: ANY_OBJECT) => {
  isCreateRule.value = true;
  isEditRule.value = true;
  ruleData.value = {
    ...rule,
  };
  removeValidate();
};
const onDeleteRule = (rule: ANY_OBJECT) => {
  ElMessageBox.confirm('是否删除此规则？', '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      let params = {
        ruleId: rule.ruleId,
      };
      return OnlineRuleController.delete(params);
    })
    .then(() => {
      if (formData.value.ruleId === rule.ruleId) {
        formData.value.ruleId = undefined;
      }
      ruleListWidget.refresh();
    })
    .catch(e => {
      console.warn(e);
    });
};
const onSaveRule = () => {
  ruleForm.value.validate((valid: boolean) => {
    if (!valid) return;
    let params = {
      onlineRuleDto: {
        ...ruleData.value,
      },
    };
    let httpCall = isEditRule.value
      ? OnlineRuleController.update(params)
      : OnlineRuleController.add(params);
    httpCall
      .then(res => {
        if (!isEditRule.value) formData.value.ruleId = res.data;
        ruleListWidget.refresh();
        isCreateRule.value = false;
      })
      .catch(e => {
        console.warn(e);
      });
  });
};
const onSetColumnRule = () => {
  let params = {
    columnId: dialogParams.value.column.columnId,
    onlineColumnRuleDtoList: [
      {
        columnId: dialogParams.value.column.columnId,
        ruleId: formData.value.ruleId,
        propDataJson: JSON.stringify({
          message: formData.value.message,
          min: formData.value.min,
          max: formData.value.max,
        }),
      },
    ],
  };
  OnlineColumnController.addOnlineColumnRule(params)
    .then(res => {
      ElMessage.success('添加成功！');
      if (props.dialog) {
        props.dialog.submit(res);
      } else {
        onCloseThirdDialog(true, res);
      }
    })
    .catch(e => {
      console.warn(e);
    });
};
const onUpdateColumnRule = () => {
  let params = {
    onlineColumnRuleDto: {
      columnId: dialogParams.value.column.columnId,
      ruleId: formData.value.ruleId,
      propDataJson: JSON.stringify({
        message: formData.value.message,
        min: formData.value.min,
        max: formData.value.max,
      }),
    },
  };
  OnlineColumnController.updateOnlineColumnRule(params)
    .then(res => {
      ElMessage.success('保存成功！');
      if (props.dialog) {
        props.dialog.submit(res);
      }
    })
    .catch(e => {
      console.warn(e);
    });
};
const onSubmit = () => {
  if (isEdit.value) {
    onUpdateColumnRule();
  } else {
    isCreateRule.value ? onSaveRule() : onSetColumnRule();
  }
};

onMounted(() => {
  if (dialogParams.value.columnRule != null) {
    formData.value = {
      ruleId: dialogParams.value.columnRule.ruleId,
      message: dialogParams.value.columnRule.columnRuleInfo.message,
      max: dialogParams.value.columnRule.columnRuleInfo.max,
      min: dialogParams.value.columnRule.columnRuleInfo.min,
    };
    ruleListWidget.refresh();
  }
});
</script>

<style scoped>
.rule-item .el-button {
  display: none;
  font-size: 14px;
}
.rule-item:hover .el-button {
  display: block;
}
</style>
