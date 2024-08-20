<template>
  <div style="padding: 16px; font-size: 14px !important; background-color: white">
    <div class="title" style="margin-top: -16px; margin-right: -16px; margin-left: -16px">
      <p>橙单，最纯粹的代码生成工具，这一切<span style="color: #f70">「橙单」</span>为您生成。</p>
      <img class="title-img" src="@/assets/img/right-icon.png" alt="" />
    </div>
    <el-row type="flex" style="padding: 24px 11px 0" class="about">
      <el-tabs v-model="activeName" type="card" style="width: 100%">
        <el-tab-pane label="关于橙单" name="about">
          <el-row>
            <el-col :span="12" class="item-block" style="border-right: 0; border-bottom: 0">
              <span class="item-title">基础架构</span>
              <ul class="item-list">
                <li>
                  前后端全部主流技术栈，Spring Boot / Spring Cloud / Element Plus / Vant / Uniapp。
                </li>
                <li>
                  基础组件包含，工作流 / 在线表单 / 统计表单 / 移动端 /
                  多租户，全部深度自研，完整可控。
                </li>
                <li>
                  弹性架构，服务组件可插拔，第三方框架快速集成，流程 / 表单 /
                  报表等服务支持多应用接入。
                </li>
                <li>
                  支持多种数据库的混合集成，MySQL / Oracle / PostgreSQL / 达梦 / 人大金仓 /
                  OpenGauss。
                </li>
              </ul>
            </el-col>
            <el-col :span="12" class="item-block" style="border-bottom: 0">
              <span class="item-title">产品质量</span>
              <ul class="item-list">
                <li>全部源码通过 SonarQube 最严格的扫描「0」警告，该标准近乎业内唯一。</li>
                <li>前端样式提供统一的多分辨率设计标准，精致且规范。</li>
                <li>
                  橙单在代码数量、质量与核心功能之间进行了良好的平衡，BUG 很少，对二次开发极为友好。
                </li>
                <li>无技术债，核心团队会定期主动优化产品中可能存在的开发体验问题。</li>
              </ul>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" class="item-block" style="border-right: 0">
              <span class="item-title">商业授权</span>
              <ul class="item-list">
                <li>
                  全部源码交付，无代码混淆，永久免费升级，无项目数量限制，无后续费用，永久性授权。
                </li>
                <li>最高性价比的同类产品，我们在定价之前，曾寻遍全网。</li>
                <li>宽松的商业授权，无任何附加条件，企业所想即是橙单所为。</li>
                <li>
                  支持绝对「免费」的代码生成服务，生成后源码全部交付，无任何橙单痕迹和包依赖。
                </li>
              </ul>
            </el-col>
            <el-col :span="12" class="item-block">
              <span class="item-title">技术支持</span>
              <ul class="item-list">
                <li>橙单，时刻为您承担，绝对不是一句口号，我们开车等灯时都会为用户答疑。</li>
                <li>
                  提供技术支持微信群，消息回复及时，问题解答高效耐心，所有用户均可对我们的服务进行监控。
                </li>
                <li>
                  文档完整详尽、结构清晰、图文并茂、美观且具备良好的阅读体验，我们根据用户反馈实时更新。
                </li>
                <li>
                  定期升级迭代，用户反馈的问题会及时修复，新功能需求将在内部评估后列入开发计划。
                </li>
              </ul>
            </el-col>
          </el-row>
          <div
            class="item-block"
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-right: 35px;
              margin-top: 16px;
            "
          >
            <div>
              <span class="item-title">我们的资源</span>
              <ul class="item-list">
                <li>
                  免费代码生成
                  <a href="https://code.orangeforms.com" target="_blank"
                    >https://code.orangeforms.com</a
                  >
                </li>
                <li>
                  线上技术文档
                  <a href="https://www.orangeforms.com" target="_blank"
                    >https://www.orangeforms.com</a
                  >
                </li>
                <li>
                  租户管理演示
                  <a href="http://tenantadmin.orangeforms.com" target="_blank"
                    >http://tenantadmin.orangeforms.com</a
                  >
                </li>
                <li>
                  租户运营演示
                  <a href="http://tenant.orangeforms.com" target="_blank"
                    >http://tenant.orangeforms.com</a
                  >
                </li>
              </ul>
            </div>
            <div style="display: inherit">
              <div class="qrcode">
                <img
                  class="title-img"
                  src="@/assets/img/demo-h5-qrcode.png"
                  alt=""
                  style="height: 128px"
                />
                <span class="icon-name">移动端演示</span>
              </div>
              <!--
              <div class="qrcode">
                <img
                  class="title-img"
                  src="@/assets/img/h5-qrcode-2.png"
                  alt=""
                  style="height: 128px"
                />
                <span class="icon-name">H5</span>
              </div>
              -->
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="示例说明" name="cases" :lazy="true">
          <p style="margin-bottom: 16px">
            <strong>在线表单，</strong>
            通过在线表单编辑器创建，配置并绑定菜单后即可生效，无代码修改，适用于相对简单的表单页面。
            <strong>路由表单，</strong>
            通过橙单生成器创建，可生成前后端代码，需编译后部署，适用于二次开发的复杂表单或业务逻辑。
          </p>
          <el-tabs
            tab-position="left"
            class="cases item-block"
            style="display: flex; padding: 0"
            :style="getContentStyle"
          >
            <el-tab-pane v-for="(tabPane, index) in tabPaneList" :key="index">
              <template v-slot:label>
                <li>{{ tabPane.title }}</li>
              </template>
              <div class="cases-content">
                <!--
                <span class="item-title">PC 端在线表单</span>
                <p class="sub-title">
                  点击菜单栏的「在线表单」菜单，即可进行在线表单的配置，PC端在线表单示例已分别绑定到「在线表单示例」和「在线工单示例」菜单的二级菜单。
                </p>
                -->
                <el-row type="flex">
                  <el-col :span="24">
                    <el-table class="content-table" :data="tabPane.tableData" border>
                      <el-table-column prop="menuName" label="菜单名称" width="250" />
                      <el-table-column prop="flowPage" label="流程页面" width="150" />
                      <el-table-column prop="bindFlow" label="绑定流程" width="150" />
                      <el-table-column prop="caseDesc" label="示例说明" />
                    </el-table>
                  </el-col>
                </el-row>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
      </el-tabs>
      <div class="qq" style="position: absolute; top: 34px; right: 25px">
        <span>技术支持 QQ 群 664800781</span>
      </div>
    </el-row>
  </div>
</template>

<script setup lang="ts">
const activeName = ref('about');
const tabPaneList = ref([
  {
    title: 'PC 端在线表单',
    tableData: [
      {
        menuName: '在线工单示例 / 合同审批',
        flowPage: '是',
        bindFlow: '合同审批 (在线)',
        caseDesc: '一对多数据多标签展示、会签和加减签、并行网关驳回。',
      },
      {
        menuName: '在线工单示例 / 报销申请',
        flowPage: '是',
        bindFlow: '报销申请 (在线)',
        caseDesc: '钉钉风格流程编辑器。',
      },
      {
        menuName: '在线工单示例 / 自由跳示例',
        flowPage: '是',
        bindFlow: '自由跳演示',
        caseDesc:
          '在流程发布时，橙单做了静态的流程分析，因此可以极为准确高效的执行驳回和自由跳逻辑。',
      },
      {
        menuName: '在线工单示例 / 文章管理',
        flowPage: '否',
        bindFlow: '文章审批',
        caseDesc: '数据列表页面可以多次发起审批流程，支持数据表字段作为下一任务审批人。',
      },
      {
        menuName: '在线表单示例 / 老师管理',
        flowPage: '否',
        bindFlow: '无',
        caseDesc: '左树右表页面配置，一对一关联选择组件。',
      },
      {
        menuName: '在线表单示例 / 学生管理',
        flowPage: '否',
        bindFlow: '无',
        caseDesc: '新建弹框支持「线框表单」、省市区划级联、批量删除。',
      },
      {
        menuName: '在线表单示例 / 课程管理',
        flowPage: '否',
        bindFlow: '无',
        caseDesc: '支持数据表字典和全局编码字典关联，支持一对多从表数据聚合计算显示，如章节数量。',
      },
      {
        menuName: '在线统计页面 / 图表展示',
        flowPage: '否',
        bindFlow: '无',
        caseDesc: '统计图表和自定义卡片展示。',
      },
      {
        menuName: '在线统计页面 / 卡片展示',
        flowPage: '否',
        bindFlow: '无',
        caseDesc: '自定义卡片、API 数据源和透视表展示。',
      },
      {
        menuName: '在线统计页面 / 下钻展示',
        flowPage: '否',
        bindFlow: '无',
        caseDesc: '图表组件「双击」后弹框显示下钻数据。',
      },
    ],
  },
  {
    title: 'PC 端路由表单',
    tableData: [
      {
        menuName: '路由工单示例 / 合同审批',
        flowPage: '是',
        bindFlow: '合同审批',
        caseDesc: '一对多数据多标签展示、会签和加减签、并行网关驳回。',
      },
      {
        menuName: '路由工单示例 / 报销申请',
        flowPage: '是',
        bindFlow: '报销申请',
        caseDesc: '功能完全等同于在线表单的报销申请流程。',
      },
      {
        menuName: '路由表单示例 / 班级管理',
        flowPage: '否',
        bindFlow: '创建班级审批',
        caseDesc:
          '左树右表、多对多级联添加。数据列表页面可以「多次发起审批流程」，列表支持进度条和从表数据聚合计算，如学生数量。',
      },
      {
        menuName: '路由表单示例 / 作业管理',
        flowPage: '否',
        bindFlow: '无',
        caseDesc: '列表页面即可打开多对多关联数据列表。',
      },
      {
        menuName: '路由表单示例 / 课程管理',
        flowPage: '否',
        bindFlow: '无',
        caseDesc: '支持一对多对多复杂关联、一对多的级联添加，编辑页面支持多标签，和显示权限控制。',
      },
      {
        menuName: '路由表单示例 / 学生管理',
        flowPage: '否',
        bindFlow: '无',
        caseDesc: '支持部分更新。',
      },
      {
        menuName: '路由表单示例 / 视频课程',
        flowPage: '否',
        bindFlow: '无',
        caseDesc: '支持主子表布局。',
      },
      {
        menuName: '路由统计页面 / 学生行为统计',
        flowPage: '否',
        bindFlow: '无',
        caseDesc: '点击表格单元中的统计数字，可「下钻」打开详情列表页面。',
      },
      {
        menuName: '路由统计页面 / 视频统计',
        flowPage: '否',
        bindFlow: '无',
        caseDesc: '支持图表展示。',
      },
    ],
  },
  {
    title: '移动端表单功能',
    tableData: [
      {
        menuName: '在线表单 / 合同审批',
        flowPage: '是',
        bindFlow: '合同审批 (在线)',
        caseDesc: '一对多数据多标签展示、会签和加减签、并行网关驳回。',
      },
      {
        menuName: '在线表单 / 课程管理',
        flowPage: '否',
        bindFlow: '无',
        caseDesc: '支持数据表字典和全局编码字典关联，支持一对多从表数据级联添加和编辑。',
      },
      {
        menuName: '在线表单 / 报表页面',
        flowPage: '否',
        bindFlow: '无',
        caseDesc: '统计图表和自定义卡片展示。',
      },
      {
        menuName: '路由表单 / 课程管理',
        flowPage: '否',
        bindFlow: '无',
        caseDesc: '支持一对多的级联添加。',
      },
      {
        menuName: '路由表单 / 班级管理',
        flowPage: '否',
        bindFlow: '无',
        caseDesc: '支持多对多的级联添加。',
      },
      {
        menuName: '路由表单 / 合同审批',
        flowPage: '是',
        bindFlow: '合同审批',
        caseDesc: '一对多数据多标签展示、会签和加减签、并行网关驳回。',
      },
      {
        menuName: '路由表单 / 视频统计',
        flowPage: '否',
        bindFlow: '无',
        caseDesc: '支持图表展示。',
      },
    ],
  },
]);

const mainContextHeight = inject('mainContextHeight', ref(200));
const getContentStyle = computed(() => {
  return [{ 'min-height': mainContextHeight.value - 221 - 24 - 16 + 'px' }];
});
</script>

<style scoped>
:deep(.el-collapse) {
  border: none;
}

:deep(.el-divider--horizontal) {
  margin: 0;
}
:deep(.el-tag) {
  padding: 0 30px;
}
:deep(.el-table th) {
  background-color: #f6f7f9 !important;
}
:deep(.el-table th .cell) {
  font-size: 14px !important;
  color: #333 !important;
  font-weight: bold !important;
}
:deep(.el-tabs__active-bar) {
  background-color: inherit;
}
:deep(li::marker) {
  font-size: 18px;
}
:deep(.el-tabs__header.is-left) {
  padding-top: 10px;
}
:deep(.el-tabs__item.is-left) {
  justify-content: left;
}
:deep(.el-tabs__item.is-left li) {
  list-style-type: disc;
}
</style>

<style lang="scss" scoped>
.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 88px;
  padding-right: 58px;
  padding-left: 25px;
  background: #f7f9fc;
}

.title p {
  height: 40px;
  margin: 0;
  font-size: 18px;
  color: #333;
  line-height: 40px;
  font-weight: bold;
}

.title p span {
  font-size: 20px;
  color: $color-primary;
}

.title-img {
  height: 100%;
}

.about {
  color: #333;
}

:deep(.el-tabs--card > .el-tabs__header .el-tabs__nav) {
  border-radius: 0;
  border-top: none;
}
:deep(.el-tabs--card > .el-tabs__header) {
  height: 35px;
}
:deep(.el-tabs--card > .el-tabs__header .el-tabs__item.is-top) {
  width: 102px;
  height: 35px !important;
  font-size: 14px !important;
  text-align: center;
  background: #f6f7f9;
  border-top: 2px solid #ebebeb !important;
  border-bottom: 1px solid #ebebeb !important;
  line-height: 35px;
}
:deep(.el-tabs--card > .el-tabs__header .el-tabs__item.is-active) {
  color: #f70;
  background-color: #fff;
  border-bottom-color: #fff !important;
  border-top: 2px solid #f70 !important;
}

.item-block {
  padding: 24px 5px 20px 15px;
  border: 1px solid #ebebeb;
  border-radius: 0;
  transition: 0.2s;
}

.item-block :deep(.el-tabs__item) {
  font-size: 14px !important;
}

.item-title {
  font-size: 16px;
  font-weight: bold;
}

.item-list {
  padding-top: 14px;
  padding-left: 4px;
  margin: 0 0 0 2px;
}
.item-list li {
  margin: 5px 0 6px 14px;
  list-style: outside;
}

.item {
  display: flex;
  align-items: center;
  height: 48px;
}

.qrcode {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.qrcode img {
  display: block;
  margin-bottom: 5px;
}
.qrcode .icon-name {
  font-size: 14px;
}

:deep(.el-tabs__nav.is-left) {
  padding: 0 9px;
}
:deep(.el-tabs__item) {
  color: #333;
}
:deep(.el-tabs--left .el-tabs__item.is-left) {
  margin-bottom: 7px !important;
  text-align: left !important;
  list-style-type: disc !important;
}
:deep(.el-tabs--left .el-tabs__header.is-left) {
  float: inherit;
  height: auto;
}
:deep(.cases > .el-tabs__header .el-tabs__item) {
  width: 168px;
  height: 40px;
  line-height: 40px;
}
:deep(.cases > .el-tabs__header .el-tabs__item.is-active) {
  color: #f70 !important;
  background-color: #fdf2e6 !important;
  border-radius: 4px;
  font-weight: normal !important;
}
.cases-content {
  padding: 20px;
}
.cases-content .sub-title {
  font-size: 14px;
  color: #333;
}
:deep(.cases > .el-tabs__content) {
  width: 100%;
}

.qq {
  color: #999;
  font-weight: 400;
}

.content-table :deep(.cell) {
  font-size: 14px !important;
}
:deep(.el-tabs--left .el-tabs__nav-wrap.is-left::after) {
  width: 1px;
}
</style>
