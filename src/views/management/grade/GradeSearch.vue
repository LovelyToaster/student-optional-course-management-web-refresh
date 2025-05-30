<script setup lang="ts">
import {useStudentStore} from "@/store";
import {h, reactive, ref} from "vue";
import {SearchOutlined, RestOutlined} from "@ant-design/icons-vue"
import {apiInstance} from "@/hooks/api";
import code from "@/hooks/code";
import {notification} from "ant-design-vue";

const studentStore = useStudentStore()
const selectedYear = ref(null)
const academicYears = reactive([])

const columns = [
  {title: '课程号', dataIndex: 'courseNo', key: 'courseNo'},
  {title: '课程', dataIndex: 'courseName', key: 'courseName'},
  {title: '平时成绩', dataIndex: 'usualGrade', key: 'usualGrade'},
  {title: '期末成绩', dataIndex: 'finalExamGrade', key: 'finalExamGrade'},
  {title: '总成绩', dataIndex: 'totalGrade', key: 'totalGrade'},
  {title: '学分', dataIndex: 'courseGrade', key: 'courseGrade'},
  {title: '绩点', dataIndex: 'coursePoint', key: 'coursePoint'},
  {title: '学期', dataIndex: 'term', key: 'term'}
];
const data = reactive([])
const rawData = reactive([])

function getAcademicYears() {
  const termSet = new Set()
  data.forEach(item => {
    if (item.term) {
      termSet.add(item.term)
    }
    if (item.totalGrade < 0) {
      item.usualGrade = "暂无"
      item.finalExamGrade = "暂无"
      item.totalGrade = "暂无"
      item.coursePoint = "暂无"
    }
  })
  Object.assign(academicYears, Array.from(termSet).sort())
}


function getGrade() {
  apiInstance.post("/grade/search", {
    studentNo: studentStore.studentInfo.studentNo,
  }).then(res => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      notification.success({
        message: '查询成功',
        description: res.data.message
      })

      const sortedGPA = res.data.data.sort((a: any, b: any) => {
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

      Object.assign(rawData, sortedGPA)
      Object.assign(data, sortedGPA)
      getAcademicYears()
    }
  })
}

function filterGrade() {
  if (selectedYear) {
    data.splice(0)
    Object.assign(data, rawData.filter(item => item.term === selectedYear.value))
  }
}

function resetFilterGrade() {
  if (selectedYear) {
    selectedYear.value = null
    Object.assign(data, rawData)
  }
}

getGrade()
</script>

<template>
  <div class="gradeSearch">
    <a-card style="width: 100%">
      <div class="gradeSearchInfo">
        <span>学号: {{ studentStore.studentInfo.studentNo }}</span>
        <span>
          平均绩点:&nbsp;
          <a-tag color="blue" style="font-size: 15px">{{ studentStore.studentInfo.averageGPA }}</a-tag>
        </span>
        <div>
          <a-select v-model:value="selectedYear" placeholder="请选择学年" style="width: 200px">
            <a-select-option v-for="item in academicYears" :value="item">
              {{ item }}
            </a-select-option>
          </a-select>
          <a-button type="primary" :icon="h(SearchOutlined)" style="margin-left: 5px" @click="filterGrade"/>
          <a-button type="primary" :icon="h(RestOutlined)" style="margin-left: 5px" @click="resetFilterGrade"/>
        </div>
      </div>
    </a-card>
  </div>
  <div class="gradeTable">
    <a-table style="width: 100%" :columns="columns" :dataSource="data"/>
  </div>
</template>

<style scoped>
.gradeSearch, .gradeTable {
  margin: 15px;
  display: flex;
}

.gradeSearchInfo {
  display: flex;
  font-size: 15px;
  font-weight: bold;
  justify-content: space-around;
}
</style>