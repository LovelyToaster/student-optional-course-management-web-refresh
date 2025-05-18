<script setup lang="ts">
import {Chart} from '@antv/g2';
import {apiDeepSeek, apiInstance} from "@/hooks/api";
import code from "@/hooks/code";
import {onMounted, reactive, ref} from "vue";
import {useLoginStore} from "@/store/";
import dayjs from "dayjs";

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

const nowTerm = ref(null)

function getStatistics(studentNosStr) {
  const gradeStatistics = reactive([])
  const now = dayjs()
  const year = now.year();
  const month = now.month() + 1;

  if (month > 7) {
    nowTerm.value = `${year - 1}-${year} 第二学期`;
  } else {
    nowTerm.value = `${year - 1}-${year} 第一学期`;
  }

  apiInstance.get("/grade/getGradeStatistics", {
    params: {
      teacherNo: loginStore.userInfo.userName,
      studentNo: studentNosStr,
      term: nowTerm.value
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
            text: (data) => `${data.item}: ${(data.percent * 100).toFixed(1)}%`,
          })
          .tooltip((data) => ({
            name: data.item,
            value: `${(data.percent * 100).toFixed(1)}%`,
          }));

      chart.render();
    }
  })
}

const tableData = reactive([])

function tableDisplay() {
  tableData.forEach(item => {
    if (item.gpa < 0)
      item.gpa = "等待成绩录入"
  })
}

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

      tableDisplay()
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

const deepseekSay = ref(null)
const isSay = ref(false)
const sayLoading = ref(true)
let prompt = null

function getDeepseekSay() {
  isSay.value = true
  apiInstance.post("/grade/search", {
    teacherNo: loginStore.userInfo.userName,
    term: nowTerm.value
  }).then(res => {
    const grade = res.data.data
    prompt = `
        我是一名教师，这是我的学生所有课的课程成绩，请使用中文总结成绩概况：

        ${JSON.stringify(grade, null, 2)}
        其中-1分的成绩为暂未录入，不需要显示在概况中

        要求：
        1. 仅基于已录入的有效成绩进行分析（分数为 -1 的视为无效，请忽略）
        2. 概括整体成绩水平（优 / 良 / 中 / 及格 / 不及格）
        3. 提出简要学习建议
        4. 需要包含Term学期和coursePoint绩点
        5. 输出自然、简洁，不要包含任何无效成绩、统计说明或注释
        `
    apiDeepSeek.post("/chat/completions", {
      model: 'deepseek-chat',
      messages: [
        {role: 'system', content: '你是一个善于数据总结的教育分析助手。'},
        {role: 'user', content: prompt}
      ],
      stream: false
    }).then(res => {
      deepseekSay.value = res.data.choices[0].message.content
      sayLoading.value = false
    })
  })
}

</script>

<template>
  <div style="margin: 15px;display: flex;">
    <a-card style="flex:1">
      <div style="font-size: 20px;font-weight: bold">{{ nowTerm }}成绩区间统计</div>
      <div id="container"></div>
    </a-card>
    <div style="display: flex;flex:1;flex-direction: column">
      <div style="margin-left: 15px;flex:1">
        <a-table :columns="columns" :data-source="tableData"></a-table>
      </div>
      <div style="margin-left: 15px;flex:1">
        <a-card title="成绩总结">
          <a-button v-if="!isSay" type="primary" @click="getDeepseekSay">点击生成AI总结</a-button>
          <div v-if="isSay">
            <a-spin tip="等待生成中" :spinning="sayLoading" style="text-align: center">
              <div style="white-space: pre-line;min-height: 50px">
                {{ deepseekSay }}
              </div>
            </a-spin>
          </div>
        </a-card>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>