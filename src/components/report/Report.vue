<template>
  <div>
    <!-- 麵包屑導航區 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首頁</el-breadcrumb-item>
      <el-breadcrumb-item>數據統計</el-breadcrumb-item>
      <el-breadcrumb-item>用戶列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片視圖 -->
    <el-card>
      <!-- 2. 為echarts準備一個具備寬高的DOM -->
      <div id="main" style="width: 650px; height: 400px"></div>
    </el-card>
  </div>
</template>

<script>
// 1. 引入 ECharts
import * as echarts from "echarts";
import _ from "lodash";

export default {
  name: "Report",
  data() {
    return {
      // 需要合併的數據
      options: {
        title: {
          text: "用戶來源",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#E9EEF3",
            },
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            boundaryGap: false,
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
      },
    };
  },
  // 頁面元素掛載完畢後初始化echarts
  async mounted() {
    // 3. 基於準備好的dom，初始化echarts實例
    var myChart = echarts.init(document.getElementById("main"));

    const { data: res } = await this.$http.get("reports/type/1");
    if (res.meta.status !== 200) {
      return this.$message.error("獲取折線圖數據失敗! ");
    }

    // 4. 準備數據和配置項
    const result = _.merge(res.data, this.options);

    // 5. 展示數據
    myChart.setOption(result);
  },
  methods: {},
};
</script>

<style lang="scss" scoped></style>
