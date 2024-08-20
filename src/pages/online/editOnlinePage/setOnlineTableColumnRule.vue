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
            <el-row justify="space-between" style="flex-wrap: nowrap; width: 100%">
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
                      type="text"
                      icon="el-icon-edit-outline"
                      style="margin-left: 30px"
                      @click.stop="onEditRule(item)"
                    />
                    <el-button
                      v-if="!item.builtin"
                      type="text"
                      icon="el-icon-circle-close"
                      @click.stop="onDeleteRule(item)"
                    />
                  </el-row>
                </el-option>
              </el-select>
              <el-button
                v-if="!isEdit"
                type="warning"
                style="margin-left: 3px"
                @click="onCreateRuleClick"
                >新建规则</el-button
              >
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
      ref="ruleDataForm"
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
            <el-input :value="SysOnlineRuleType.getValue(ruleData.ruleType)" disabled />
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
import { ElMessage, ElMessageBox } from 'element-plus';
import { findItemFromList } from '@/common/utils';
import { OnlineRuleController, OnlineColumnController } from '@/api/online';
import { SysOnlineRuleType } from '@/common/staticDict/online';
import { useDropdown } from '@/common/hooks/useDropdown';
import { DropdownOptions, ListData } from '@/common/types/list';
import { useThirdParty } from '@/components/thirdParty/hooks';
import { ThirdProps } from '@/components/thirdParty/types';
import { ANY_OBJECT } from '@/types/generic';
import { DialogProp } from '@/components/Dialog/types';
import { useLayoutStore } from '@/store';
const layoutStore = useLayoutStore();

interface IProps extends ThirdProps {
  column?: ANY_OBJECT;
  columnRule?: ANY_OBJECT;
  // 当使用Dialog.show弹出组件时，须定义该prop属性，以便对dialog进行回调
  dialog?: DialogProp<boolean>;
}
const props = defineProps<IProps>();
const { thirdParams, onCloseThirdDialog } = useThirdParty(props);
const formItemSize = computed(() => {
  return layoutStore.defaultFormItemSize || thirdParams.value.defaultFormItemSize?.value;
});

const form = ref();
const ruleDataForm = ref();
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
const rules: ANY_OBJECT = {
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
  return findItemFromList(ruleListWidget.value.dropdownList, formData.value.ruleId, 'ruleId');
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
  isTree: false,
};

const ruleListWidget = ref<ANY_OBJECT>(useDropdown(dropdownOptions));

const removeValidate = () => {
  if (ruleDataForm.value) ruleDataForm.value.clearValidate();
  if (form.value) form.value.clearValidate();
};
const onCancelClick = () => {
  if (!isCreateRule.value) {
    onCancel(false);
  }
  isCreateRule.value = isEditRule.value = false;
  removeValidate();
};
const onCancel = (isSuccess: boolean) => {
  if (props.dialog) {
    if (isSuccess) {
      props.dialog.submit(true);
    } else {
      props.dialog.cancel();
    }
  } else {
    onCloseThirdDialog(isSuccess);
  }
};
const onSubmit = () => {
  if (isEdit.value) {
    onUpdateColumnRule();
  } else {
    isCreateRule.value ? onSaveRule() : onSetColumnRule();
  }
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
      ruleListWidget.value.refresh(true);
    })
    .catch((e: Error) => {
      console.warn(e);
    });
};
const onSaveRule = () => {
  ruleDataForm.value.validate((valid: boolean) => {
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
        ruleListWidget.value.refresh(true);
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
    .then(() => {
      ElMessage.success('添加成功！');
      onCancel(true);
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
    .then(() => {
      ElMessage.success('保存成功！');
      onCancel(true);
    })
    .catch(e => {
      console.warn(e);
    });
};
const onRuleIdChange = () => {
  formData.value.message = undefined;
};

onMounted(() => {
  if (dialogParams.value.columnRule != null) {
    formData.value = {
      ruleId: dialogParams.value.columnRule.ruleId,
      message: dialogParams.value.columnRule.columnRuleInfo.message,
      max: dialogParams.value.columnRule.columnRuleInfo.max,
      min: dialogParams.value.columnRule.columnRuleInfo.min,
    };
    ruleListWidget.value.onVisibleChange(true);
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
