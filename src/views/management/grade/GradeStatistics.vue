<script setup>
import {Chart} from '@antv/g2';
import {onMounted, reactive} from "vue";
import {useLoginStore, useStudentStore} from "@/store/index.js";
import apiInstance from "@/hooks/api.js";
import code from "@/hooks/code.js";

const loginStore = useLoginStore()
const studentStore = useStudentStore()

onMounted(() => {
  const gradeStatistics = reactive([])
  apiInstance.get("/grade/getGradeStatistics", {
    params: {
      studentNo: loginStore.userInfo.userName
    }
  }).then(res => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      Object.assign(gradeStatistics, res.data.data)
      const chart = new Chart({
        container: 'container',
        autoFit: true,
      });
      chart.coordinate({type: 'theta', outerRadius: 0.8});

      chart
          .interval()
          .data(gradeStatistics)
          .transform({type: 'stackY'})
          .encode('y', 'percent')
          .encode('color', 'item')
          .legend('color', {position: 'bottom', layout: {justifyContent: 'center'}})
          .label({
            position: 'outside',
            text: (data) => `${data.item}: ${data.percent * 100}%`,
          })
          .tooltip((data) => ({
            name: data.item,
            value: `${data.percent * 100}%`,
          }));

      chart.render();
    }
  })
})

const columns = [
  {
    title: '学期',
    dataIndex: 'term',
  },
  {
    title: '平均绩点',
    dataIndex: 'gpa',
  },
  {
    title: '学分',
    dataIndex: 'courseGrade',
  },
];
</script>

<template>
  <div style="margin: 15px;display: flex;">
    <a-card style="flex:1">
      <div style="font-size: 20px;font-weight: bold">在校成绩区间统计</div>
      <div id="container"></div>
    </a-card>
    <div style="margin-left: 15px;flex:1">
      <a-table :columns="columns" :data-source="studentStore.gpaList"></a-table>
    </div>
  </div>
</template>

<style scoped>

</style>