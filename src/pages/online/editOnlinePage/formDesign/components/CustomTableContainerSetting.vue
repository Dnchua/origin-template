<template>
  <el-form
    class="custom-widget-attribute custom-table-container-setting"
    label-position="top"
    label-width="115px"
    size="default"
    @submit.prevent
  >
    <el-form-item label="列管理" style="width: 100%">
      <template #label>
        <el-row justify="space-between" align="middle" style="width: 100%">
          <span>列管理</span>
          <el-icon style="cursor: pointer; font-size: 14px" @click="insertColumns"
            ><CirclePlus
          /></el-icon>
        </el-row>
      </template>
      <div class="col-list">
        <div class="col-item" v-for="column in colList" :key="column.colIndex">
          <el-row
            type="flex"
            justify="space-between"
            align="middle"
            style="width: 100%; height: 40px; line-height: 40px; font-size: 14px"
          >
            <el-icon style="cursor: pointer" @click="onExpandChange(column)"
              ><span style="margin-left: 5px; font-size: 12px">{{ column.colName }}</span>
              <CaretTop v-if="expandStatus[column.colIndex]" />
              <CaretBottom v-else />
            </el-icon>
            <el-icon style="cursor: pointer" @click="deleteColumn(column)"><Remove /></el-icon>
          </el-row>
          <div
            class="col-attribute"
            style="padding: 20px; background: #fafbfc"
            v-show="expandStatus[column.colIndex]"
          >
            <el-row class="col-attribute-item" justify="space-between" align="middle">
              <span class="label">列宽设置</span>
              <el-input
                size="default"
                :value="column.width"
                style="width: 130px"
                @input="(val: string) => onColumnWidthChange(column, val)"
              />
            </el-row>
            <el-row
              class="col-attribute-item"
              type="flex"
              justify="space-between"
              align="middle"
              style="margin-top: 10px"
            >
              <span class="label">对齐方式</span>
              <div>
                <i
                  class="online-icon icon-align-top align-item"
                  :class="{ active: column.valign === 'top' }"
                  @click="onColumnAlignChange(column, 'top')"
                />
                <i
                  class="online-icon icon-align-middle align-item"
                  :class="{ active: column.valign === 'middle' }"
                  @click="onColumnAlignChange(column, 'middle')"
                />
                <i
                  class="online-icon icon-align-bottom align-item"
                  :class="{ active: column.valign === 'bottom' }"
                  @click="onColumnAlignChange(column, 'bottom')"
                />
              </div>
            </el-row>
          </div>
        </div>
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { CirclePlus, Remove, CaretTop, CaretBottom } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import { ANY_OBJECT } from '@/types/generic';

const formConfig = inject('formConfig', () => {
  console.error('CustomTableContainerSetting: formConfig not injected');
  return {} as ANY_OBJECT;
});
const expandStatus = ref<(ANY_OBJECT | boolean)[]>([]);
const currentWidgetActions = computed(() => {
  return formConfig().currentWidget.props.actions;
});
const indexData = computed<ANY_OBJECT[]>(() => {
  return Array.isArray(currentWidgetActions.value.indexData)
    ? currentWidgetActions.value.indexData
    : [];
});
const colList = computed(() => {
  if (!Array.isArray(indexData.value) || indexData.value.length === 0) return [];
  let row = indexData.value[0];
  return row.map((column: ANY_OBJECT, colIndex: number) => {
    expandStatus.value[colIndex] =
      expandStatus.value[colIndex] == null ? true : expandStatus.value[colIndex];
    return {
      colIndex: colIndex,
      width: column.width,
      valign: column.valign,
      colName: `第 ${colIndex + 1} 列`,
    };
  });
});

const exec = (action: string, params: ANY_OBJECT) => {
  if (currentWidgetActions.value[action]) {
    currentWidgetActions.value[action](params);
  }
};
const insertColumns = () => {
  exec('setSource', {
    rowIndex: 0,
    colIndex: indexData.value[0].length - 1,
  });
  this.exec('insertColumns');
};
const deleteColumn = (column: ANY_OBJECT) => {
  ElMessageBox.confirm(`是否删除 ${column.colName} ?`, '', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      expandStatus.value.splice(column.colIndex, 1);
      exec('deleteColumns', column.colIndex);
    })
    .catch(e => {
      console.warn(e);
    });
};
const onColumnWidthChange = (column: ANY_OBJECT, val: string) => {
  column.width = val;
  updateColumn(column);
};
const onColumnAlignChange = (column: ANY_OBJECT, val: string) => {
  column.valign = val;
  updateColumn(column);
};
const updateColumn = (column: ANY_OBJECT) => {
  currentWidgetActions.value.setColumn(column.colIndex, {
    ...column,
  });
};
const onExpandChange = (column: ANY_OBJECT) => {
  expandStatus.value[column.colIndex] = !expandStatus.value[column.colIndex];
  expandStatus.value = [...expandStatus.value];
};
</script>

<style scoped>
.custom-table-container-setting.el-form--label-top :deep(.el-form-item__label) {
  width: 100%;
  padding-bottom: 5px !important;
  line-height: 25px;
}

.col-attribute-item .label {
  font-size: 12px;
}
</style>

<style lang="scss" scoped>
.align-item {
  width: 30px;
  height: 30px;
  line-height: 30px;
  font-size: 20px;
  color: #454545;
  cursor: pointer;
}

.align-item + .align-item {
  margin-left: 10px;
}

.align-item.active {
  color: $color-primary;
}
</style>
