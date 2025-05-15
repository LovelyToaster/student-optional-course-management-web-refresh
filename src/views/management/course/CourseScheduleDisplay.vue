<script setup lang="ts">
import {h, reactive, ref} from "vue";
import {RestOutlined, SearchOutlined} from "@ant-design/icons-vue";
import CourseSchedule from "@/components/CourseSchedule.vue";
import {apiInstance} from "@/hooks/api";
import code from "@/hooks/code";
import {notification} from "ant-design-vue";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {useLoginStore, useStudentStore, useTeacherStore} from "@/store";

const teacherStore = useTeacherStore()
const loginStore = useLoginStore()

const courseScheduleList = reactive([])

function getCourseScheduleTeacher() {
  apiInstance.post("/courseSchedule/search", {
    teacherNo: teacherStore.teacherInfo.teacherNo,
    week: `${nowYear.value}-${nowWeek.value}`
  }).then(res => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      notification.success({
        message: "成功",
        description: res.data.message
      })
      courseScheduleList.splice(0, courseScheduleList.length, ...res.data.data)
    }
  })
}

function getCourseScheduleStudent() {
  apiInstance.post("/courseSchedule/search", {
    studentNo: studentStore.studentInfo.studentNo,
    classNo: studentStore.studentInfo.classNo,
    week: `${nowYear.value}-${nowWeek.value}`
  }).then(res => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      notification.success({
        message: "成功",
        description: res.data.message
      })
      courseScheduleList.splice(0, courseScheduleList.length, ...res.data.data)
    }
  })
}

function getCourseSchedule() {
  if (loginStore.userInfo.permissions === 2) {
    getCourseScheduleStudent()
  } else if (loginStore.userInfo.permissions === 1) {
    getCourseScheduleTeacher()
  }
}

dayjs.extend(isoWeek)

const nowYear = ref(null)
const nowWeek = ref(null)

function getNowWeek() {
  const now = dayjs()
  const year = now.year()
  const week = now.isoWeek()
  nowYear.value = year
  nowWeek.value = week
  getCourseSchedule()
}

const week = ref()

function weekSearchTeacher() {
  const start = dayjs(week.value)
  nowYear.value = start.year()
  nowWeek.value = start.isoWeek()
  apiInstance.post("/courseSchedule/search", {
    teacherNo: teacherStore.teacherInfo.teacherNo,
    week: `${nowYear.value}-${nowWeek.value}`
  }).then(res => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      notification.success({
        message: "成功",
        description: res.data.message
      })
      courseScheduleList.splice(0, courseScheduleList.length, ...res.data.data)
    }
  })
}

function weekSearchStudent() {
  const start = dayjs(week.value)
  nowYear.value = start.year()
  nowWeek.value = start.isoWeek()
  apiInstance.post("/courseSchedule/search", {
    studentNo: studentStore.studentInfo.studentNo,
    classNo: studentStore.studentInfo.classNo,
    week: `${nowYear.value}-${nowWeek.value}`
  }).then(res => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      notification.success({
        message: "成功",
        description: res.data.message
      })
      courseScheduleList.splice(0, courseScheduleList.length, ...res.data.data)
    }
  })
}

function resetWeekSearch() {
  getNowWeek()
  week.value = null
}

const studentStore = useStudentStore()

function allCourseStudent() {
  apiInstance.post("/courseSchedule/search", {
    studentNo: studentStore.studentInfo.studentNo,
    classNo: studentStore.studentInfo.classNo,
    week: null
  }).then(res => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      notification.success({
        message: "成功",
        description: res.data.message
      })
      nowWeek.value = null
      courseScheduleList.splice(0, courseScheduleList.length, ...res.data.data)
    }
  })
}

function allCourseTeacher() {
  apiInstance.post("/courseSchedule/search", {
    teacherNo: teacherStore.teacherInfo.teacherNo,
    week: null
  }).then(res => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      notification.success({
        message: "成功",
        description: res.data.message
      })
      nowWeek.value = null
      courseScheduleList.splice(0, courseScheduleList.length, ...res.data.data)
    }
  })
}

function allCourse() {
  if (loginStore.userInfo.permissions === 2) {
    allCourseStudent()
  } else if (loginStore.userInfo.permissions === 1) {
    allCourseTeacher()
  }
}

function weekSearch() {
  if (loginStore.userInfo.permissions === 2) {
    weekSearchStudent()
  } else if (loginStore.userInfo.permissions === 1) {
    weekSearchTeacher()
  }
}

getNowWeek()
</script>

<template>
  <div style="margin: 15px">
    <div>
      <a-card>
        <a-date-picker picker="week" v-model:value="week"/>
        <a-button :icon="h(SearchOutlined)" type="primary" style="margin-left: 5px" @click="weekSearch">搜索</a-button>
        <a-button type="primary" style="margin-left: 5px" @click="allCourse">查看全部课表</a-button>
        <a-button :icon="h(RestOutlined)" type="primary" style="margin-left: 5px" @click="resetWeekSearch">重置
        </a-button>
      </a-card>
    </div>
    <div style="font-size: 30px;text-align: center;font-weight: bold;margin-top: 15px" v-if="nowWeek!=null">
      {{ nowYear }}年第{{ nowWeek }}周课表
    </div>
    <div style="font-size: 30px;text-align: center;font-weight: bold;margin-top: 15px" v-if="nowWeek===null">
      全部课程
    </div>
    <CourseSchedule :courseScheduleList="courseScheduleList"/>
  </div>
</template>

<style scoped>

</style>