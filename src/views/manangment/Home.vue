<script setup lang="ts">
import {useLoginStore, useTeacherStore, useStudentStore} from '@/store';
import {UserOutlined} from "@ant-design/icons-vue";
import {ref} from "vue";

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
    name: "毕业院校",
    key: "teacherGraduateInstitutions"
  },
  {
    name: "状态",
    key: "teacherStatus"
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
    key: "studentFaculties"
  },
  {
    name: "班级",
    key: "studentClass"
  }
]

let data = null
let dataSpinning = ref(true)

function getUserData() {
  if (loginStore.userInfo.permissions === 1) {
    data = teacherStore.teacherInfo
    dataSpinning.value = false
  } else if (loginStore.userInfo.permissions === 2) {
    data = studentStore.studentInfo
    dataSpinning.value = false
  }
}

getUserData()

</script>

<template>
  <div class="homeInfo">
    <a-card style="margin-right:15px;width: calc(20vw - 30px);display: flex" bodyStyle="width:100%;text-align:center">
      <a-avatar :size="150" :src="loginStore.userInfo.avatarPath" style="margin-bottom: 5px">
        <template #icon>
          <UserOutlined/>
        </template>
      </a-avatar>
      <div class="info">
        <div>姓名: {{
            loginStore.userInfo.permissions === 1 ? teacherStore.teacherInfo.teacherName : studentStore.studentInfo.studentName
          }}
        </div>
        <div v-if="loginStore.userInfo.permissions===1">编号: {{ teacherStore.teacherInfo.teacherNo }}</div>
        <div v-if="loginStore.userInfo.permissions===2">学号: {{ studentStore.studentInfo.studentNo }}</div>
      </div>
      <a-divider></a-divider>
      <div v-if="loginStore.userInfo.permissions===2" class="otherInfo">
        综合绩点: xxx
      </div>
      <div class="otherInfo">
        {{ time }}
      </div>
    </a-card>
    <a-card style="width: calc(80vw - 30px)" title="个人信息">
      <a-spin :spinning="dataSpinning">
        <a-descriptions bordered>
          <template v-for="label in loginStore.userInfo.permissions === 1 ? teacherTable : studentTable">
            <a-descriptions-item :label="label.name">
              {{ data[label.key] }}
            </a-descriptions-item>
          </template>
        </a-descriptions>
      </a-spin>
    </a-card>
  </div>
</template>

<style scoped>
.homeInfo {
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