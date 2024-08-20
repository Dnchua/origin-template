<template>
  <div style="padding: 16px; background-color: white">
    <div class="title">
      <p>您看到的所有演示功能，无需手写一行代码，这一切都由<span> 橙单 </span>为您生成。</p>
    </div>
    <el-row type="flex">
      <el-col :span="16">
        <div style="width: 100%">
          <el-card class="box-card" shadow="never" :body-style="{ padding: '0px 20px' }">
            <el-collapse v-model="currentItem">
              <el-collapse-item title="选择橙单" name="1">
                <ul class="item-list">
                  <li>
                    <strong>承诺</strong
                    >，全网最低价和最宽松的商业版授权，全部源码交付，包名随便改，永久免费升级。
                  </li>
                  <li>
                    <strong>理念</strong>，极强大的代码生成能力，80%
                    以上的业务代码无需手写，对二次开发非常友好。
                  </li>
                  <li>
                    <strong>功能</strong
                    >，工作流、在线表单、统计报表和打印、多租户、用户权限、数据权限过滤、全类型数据字典等，全部深度支持，绝非简单集成。
                  </li>
                  <li>
                    <strong>架构</strong
                    >，云原生架构设计理念，接口正交化组合，同时支持多种第三方应用和多租户的快速接入能力。
                  </li>
                  <li>
                    <strong>代码</strong>，顶级的代码强度和质量，近 10 万行代码全部通过 SonarQube
                    最严格的代码扫描，0 警告。
                  </li>
                  <li>
                    <strong>支持</strong>，30 万字的线上文档和技术专栏，助您快速吃透橙单。活跃的 VIP
                    微信群技术支持，必要时可提供远程协助服务。
                  </li>
                </ul>
              </el-collapse-item>
              <el-collapse-item title="最新功能" name="2">
                <ul class="item-list">
                  <li>前端，全新的样式设计上线。</li>
                  <li>多租户，集成在线表单。</li>
                  <li>多租户，集成工作流。</li>
                  <li>多租户，集成报表打印。</li>
                  <li>多租户，支持动态多数据源。</li>
                  <li>多租户，数据同步服务优化后合并。</li>
                  <li>工作流，支持钉钉风格流程编辑器，目前已同时支持两种高颜值流程编辑器。</li>
                  <li>工作流，流程工单编号字段，升级为高可靠性的自动编码规则计算处理方式。</li>
                  <li>
                    基础架构，在线表单、工作流和报表打印等编辑器的 UI 做了进一步的优化和统一。
                  </li>
                  <li>基础架构，升级自动编码规则计算的高可靠性处理。</li>
                </ul>
              </el-collapse-item>
              <el-collapse-item title="技术选型" name="3">
                <ul class="item-list">
                  <li>Element (Vue) / x-spreadsheet / ECharts / Axios / Webpack</li>
                  <li>Spring Boot / Spring Cloud / Spring Cloud Alibaba + Mybatis + Jwt</li>
                  <li>Hutool + Guava + Caffeine + Lombok + MapStruct + Flowable + x-easypdf</li>
                  <li>
                    Redis + Zookeeper + Nacos + Consul + XXL-Job + Quartz + Kafka + RocketMQ + Seata
                  </li>
                  <li>ELK + PinPoint / SkyWalking + Grafana + Prometheus</li>
                </ul>
              </el-collapse-item>
            </el-collapse>
          </el-card>
        </div>
      </el-col>
      <el-col :span="8">
        <el-card
          class="box-card"
          style="min-width: 450px; margin-left: 20px"
          shadow="never"
          :body-style="{ padding: '0px 20px' }"
        >
          <div class="item">
            <span style="width: 120px">产品名称</span>
            <el-tag effect="dark" size="large" style="padding-right: 30px; padding-left: 30px"
              >橙单代码生成器</el-tag
            >
          </div>
          <el-divider></el-divider>
          <div class="item">
            <span style="width: 120px">网站首页</span>
            <a href="http://www.orangeforms.com/" target="_blank">http://www.orangeforms.com/</a>
          </div>
          <el-divider></el-divider>
          <div class="item">
            <span style="width: 120px">大屏演示</span>
            <a href="http://demo.orangeforms.com/visualization" target="_blank"
              >http://demo.orangeforms.com/visualization</a
            >
          </div>
          <el-divider></el-divider>
          <div class="item">
            <span style="width: 120px">租户管理</span>
            <a href="http://tenantadmin.orangeforms.com/" target="_blank"
              >http://tenantadmin.orangeforms.com/</a
            >
          </div>
          <el-divider></el-divider>
          <div class="item">
            <span style="width: 120px">租户运营</span>
            <a href="http://tenant.orangeforms.com/" target="_blank"
              >http://tenant.orangeforms.com/</a
            >
          </div>
          <el-divider></el-divider>
          <div class="item">
            <span style="width: 120px">开发文档</span>
            <a href="http://www.orangeforms.com/development-doc/" target="_blank"
              >http://www.orangeforms.com/development-doc/</a
            >
          </div>
          <el-divider></el-divider>
          <div class="item">
            <span style="width: 120px">开源代码</span>
            <a href="https://gitee.com/orangeform/orange-admin" target="_blank"
              >https://gitee.com/orangeform/orange-admin</a
            >
          </div>
          <el-divider></el-divider>
          <div class="item">
            <span style="width: 120px">联系方式</span>
            <span>
              QQ群
              <a
                target="_blank"
                style="margin-left: 5px"
                href="https://qm.qq.com/cgi-bin/qm/qr?k=DNjpoWk6FDXAR1h94K54HNzugh7H2oBw&jump_from=webapi&authKey=KAnbT2q078MImJZ1TOHmHZA4lrzLw87xHU4RxRHrdky46GDMl3ZYWktsr9URrObc"
              >
                664800781
              </a>
            </span>
          </div>
          <el-divider></el-divider>
          <div class="item" style="height: 220px">
            <span>
              <img :src="vantImage" style="width: 200px; height: 200px" />
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Welcome',
};
</script>

<script setup lang="ts">
import vantImage from '@/assets/img/vant.png';
const currentItem = ['1', '2', '3', '4'];
</script>

<style lang="scss" scoped>
:deep(.el-collapse) {
  border: none;
}
:deep(.el-divider--horizontal) {
  margin: 0;
}
:deep(.el-tag) {
  padding: 0 30px;
}

.title {
  margin-bottom: 20px;
  border: 1px solid #ededed;
  border-left-width: 5px;
  border-left-color: $color-primary;
}

.title p {
  height: 40px;
  padding-left: 20px;
  margin: 0;
  font-size: 16px;
  line-height: 40px;
}

.title p span {
  font-size: 20px;
  color: $color-primary;
}

.item-list {
  margin: 0;
}
.item-list li {
  margin: 10px 0;
}

.item {
  display: flex;
  align-items: center;
  height: 48px;
}

strong.warning {
  font-size: 16px;
  color: red;
}
</style>
