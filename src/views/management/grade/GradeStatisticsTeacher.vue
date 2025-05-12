<script setup lang="ts">
import {Chart} from '@antv/g2';
import apiInstance from "@/hooks/api";
import code from "@/hooks/code";
import {onMounted, reactive} from "vue";
import {useLoginStore} from "@/store/";

const loginStore = useLoginStore()

function getStudentNo() {
  apiInstance.post("/grade/search", {
    teacherNo: loginStore.userInfo.userName
  })
      .then(res => {
        if (res.data.code === code.SEARCH_SUCCESS) {
          const studentNos = [...new Set(res.data.data.map(course => course.studentNo))];

          const studentNosStr = studentNos.join(',');

          getStatistics(studentNosStr)

          getGPA(studentNosStr)
        }
      })
}

function getStatistics(studentNosStr) {
  const gradeStatistics = reactive([])
  apiInstance.get("/grade/getGradeStatistics", {
    params: {
      teacherNo: loginStore.userInfo.userName,
      studentNo: studentNosStr
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
}

const tableData = reactive([])

function getGPA(studentNosStr) {
  apiInstance.get("/grade/getGPA", {
    params: {
      teacherNo: loginStore.userInfo.userName,
      studentNo: studentNosStr
    }
  }).then(res => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      const sortedGPA = res.data.data.GPA.sort((a: any, b: any) => {
        const parseTerm = (term: string) => {
          const [yearPart, semesterPart] = term.split(" ");
          const [startYear, endYear] = yearPart.split("-").map(Number);
          const semesterNum = semesterPart.includes("第一") ? 1 : 2;
          return {startYear, endYear, semesterNum};
        };

        const termA = parseTerm(a.term);
        const termB = parseTerm(b.term);

        if (termA.startYear !== termB.startYear) {
          return termA.startYear - termB.startYear;
        }
        if (termA.endYear !== termB.endYear) {
          return termA.endYear - termB.endYear;
        }
        return termA.semesterNum - termB.semesterNum;
      });

      tableData.splice(0, tableData.length, ...sortedGPA);
    }
  })
}

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

onMounted(() => {
  getStudentNo()
})
</script>

<template>
  <div style="margin: 15px;display: flex;">
    <a-card style="flex:1">
      <div style="font-size: 20px;font-weight: bold">在校成绩区间统计</div>
      <div id="container"></div>
    </a-card>
    <div style="margin-left: 15px;flex:1">
      <a-table :columns="columns" :data-source="tableData"></a-table>
    </div>
  </div>
</template>

<style scoped>

</style>