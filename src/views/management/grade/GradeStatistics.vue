<script setup>
import {Chart} from '@antv/g2';
import {onMounted, reactive, ref} from "vue";
import {useLoginStore, useStudentStore} from "@/store/index.js";
import {apiInstance, apiDeepSeek} from "@/hooks/api.js";
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

const deepseekSay = ref(null)
const isSay = ref(false)
const sayLoading = ref(true)
let prompt = null

function getDeepseekSay() {
  isSay.value = true
  apiInstance.post("/grade/search", {
    studentNo: loginStore.userInfo.userName
  }).then(res => {
    const grade = res.data.data
    prompt = `
        这是${studentStore.studentInfo.studentName}课程成绩，请使用中文总结成绩概况：

        ${JSON.stringify(grade, null, 2)}
        其中-1分的成绩为暂未录入，不需要显示在概况中

        要求：
        1. 概括整体成绩水平（优 / 良 / 中 / 及格 / 不及格）
        2. 提出简要学习建议
        3. 语言自然、简洁
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
      <div style="font-size: 20px;font-weight: bold">在校成绩区间统计</div>
      <div id="container"></div>
    </a-card>
    <div style="display: flex;flex:1;flex-direction: column">
      <div style="margin-left: 15px;flex:1">
        <a-table :columns="columns" :data-source="studentStore.gpaList"></a-table>
      </div>
      <div style="margin-left: 15px;flex:1">
        <a-card title="成绩总结">
          <a-button v-if="!isSay" type="primary" @click="getDeepseekSay">点击生成ai总结</a-button>
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