<script setup lang="ts">
import {useLoginStore, useTeacherStore, useStudentStore} from '@/store';
import {UserOutlined} from "@ant-design/icons-vue";
import {onMounted, reactive, ref} from "vue";
import apiInstance from "@/hooks/api";
import code from "@/hooks/code";
import {Chart} from '@antv/g2';

const loginStore = useLoginStore();
const teacherStore = useTeacherStore();
const studentStore = useStudentStore();

let time = ref("加载中")
setInterval(() => {
  time.value = new Date().toLocaleString();
})

const teacherTable = [
  {
    name: "编号",
    key: "teacherNo"
  },
  {
    name: "姓名",
    key: "teacherName"
  },
  {
    name: "性别",
    key: "teacherSex"
  },
  {
    name: "年龄",
    key: "teacherAge"
  },
  {
    name: "学历",
    key: "teacherDegree"
  },
  {
    name: "职称",
    key: "teacherJob"
  },
  {
    name: "所属院系",
    key: "facultyName"
  },
  {
    name: "毕业院校",
    key: "teacherGraduateInstitutions"
  }, {
    name: "邮箱",
    key: "email"
  }
]

const studentTable = [
  {
    name: "学号",
    key: "studentNo"
  },
  {
    name: "姓名",
    key: "studentName"
  },
  {
    name: "性别",
    key: "studentSex"
  },
  {
    name: "年龄",
    key: "studentAge"
  },
  {
    name: "学院",
    key: "facultyName"
  },
  {
    name: "班级",
    key: "className"
  }, {
    name: "邮箱",
    key: "email"
  }
]

let data = null
let dataSpinning = ref(true)

function getUserData() {
  if (loginStore.userInfo.permissions === 0 || loginStore.userInfo.permissions === 1) {
    data = teacherStore.teacherInfo
    dataSpinning.value = false
  } else if (loginStore.userInfo.permissions === 2) {
    data = studentStore.studentInfo
    dataSpinning.value = false
  }
}

function initChart() {
  const chart = new Chart({
    container: 'gpaChart',
    autoFit: true,
  });

  chart
      .data({
        value: studentStore.gpaList,
        transform: [
          {
            type: 'rename',
            gpa: "GPA",
            term: "学期"
          }
        ],
      })
      .encode('x', '学期')
      .encode('y', 'GPA')
      .scale('x', {
        range: [0, 1],
      })
      .scale('y', {
        domainMin: 0,
        nice: true,
      })
      .title('绩点统计');

  chart.line().label({
    text: 'GPA',
    style: {
      dx: -10,
      dy: -12,
    },
  });

  chart.point().style('fill', 'white').tooltip(false);

  chart.render();
}

function getGPA() {
  if (loginStore.userInfo.permissions === 2) {
    apiInstance.get("/grade/getGPA", {
      params: {
        teacherNo: "",
        studentNo: loginStore.userInfo.userName
      }
    }).then(res => {
      if (res.data.code === code.SEARCH_SUCCESS) {
        data.averageGPA = res.data.data.averageGPA
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
        Object.assign(studentStore.gpaList, sortedGPA)
        initChart()
      }
    })
  }
}

onMounted(() => {
  getGPA()
})
getUserData()

</script>

<template>
  <div class="homeInfo">
    <a-card style="margin-right:15px;width: calc(20vw - 30px);display: flex"
            :bodyStyle="{ width: '100%', textAlign: 'center' }">
      <a-avatar :size="150" :src="loginStore.userInfo.avatarPath" style="margin-bottom: 5px">
        <template #icon>
          <UserOutlined/>
        </template>
      </a-avatar>
      <div class="info">
        <div>姓名: {{
            loginStore.userInfo.permissions === 2 ? studentStore.studentInfo.studentName : teacherStore.teacherInfo.teacherName
          }}
        </div>
        <div v-if="loginStore.userInfo.permissions===1">编号: {{ teacherStore.teacherInfo.teacherNo }}</div>
        <div v-if="loginStore.userInfo.permissions===2">学号: {{ studentStore.studentInfo.studentNo }}</div>
      </div>
      <a-divider></a-divider>
      <div v-if="loginStore.userInfo.permissions===2" class="otherInfo">
        平均绩点:&nbsp;
        <a-tag color="blue" style="font-size: 15px">{{ studentStore.studentInfo.averageGPA }}</a-tag>
      </div>
      <div class="otherInfo">
        {{ time }}
      </div>
    </a-card>
    <a-card style="width: calc(80vw - 30px)" title="个人信息">
      <a-spin :spinning="dataSpinning">
        <a-descriptions bordered>
          <template v-for="label in loginStore.userInfo.permissions === 2 ? studentTable : teacherTable">
            <a-descriptions-item :label="label.name">
              {{ data[label.key] }}
            </a-descriptions-item>
          </template>
        </a-descriptions>
      </a-spin>
    </a-card>
  </div>
  <div class="chart" v-if="loginStore.userInfo.permissions === 2">
    <a-card style="width: 100%">
      <div id="gpaChart" style="max-height: calc(40vh - 30px);"></div>
    </a-card>
  </div>
</template>

<style scoped>
.homeInfo, .chart {
  margin: 15px;
  display: flex;
}

.info div {
  margin-top: 5px;
  font-size: 15px;
  font-weight: bold;
}

.otherInfo {
  font-size: 15px;
  font-weight: bold;
}
</style>