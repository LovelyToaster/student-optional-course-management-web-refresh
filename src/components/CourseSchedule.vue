<script setup lang="ts">
import {reactive, ref, watch} from "vue";
import {PlusCircleTwoTone} from '@ant-design/icons-vue'
import {apiInstance} from "@/hooks/api";
import code from "@/hooks/code";
import dayjs from "dayjs";
import isoWeek from 'dayjs/plugin/isoWeek'
import {notification} from "ant-design-vue";
import {useLoginStore} from "@/store";

dayjs.extend(isoWeek);

const columns = [
  {
    title: '节次',
    dataIndex: 'time',
    key: 'time',
    fixed: 'left',
    width: 100,
  },
  {title: '星期一', dataIndex: 'mon', key: '1'},
  {title: '星期二', dataIndex: 'tue', key: '2'},
  {title: '星期三', dataIndex: 'wed', key: '3'},
  {title: '星期四', dataIndex: 'thu', key: '4'},
  {title: '星期五', dataIndex: 'fri', key: '5'},
  {title: '星期六', dataIndex: 'sat', key: '6'},
  {title: '星期日', dataIndex: 'sun', key: '7'},
]

const schedule = ref(
    Array.from({length: 12}, (_, i) => ({time: String(i + 1)}))
)

const weekMap = {
  '1': 'mon',
  '2': 'tue',
  '3': 'wed',
  '4': 'thu',
  '5': 'fri',
  '6': 'sat',
  '7': 'sun'
}

const prop = defineProps(['courseScheduleList'])

watch(prop.courseScheduleList, (newList) => {
  schedule.value = Array.from({length: 12}, (_, i) => ({time: String(i + 1)}))

  newList.forEach(course => {
    const timeIndex = schedule.value.findIndex(row => row.time === course.time)
    const columnKey = weekMap[course.week]

    if (timeIndex !== -1 && columnKey) {
      if (!schedule.value[timeIndex][columnKey]) {
        schedule.value[timeIndex][columnKey] = []
      }
      schedule.value[timeIndex][columnKey].push(course)
    }
  })
}, {immediate: true}) // 页面加载时立即执行一次

const isOpen = ref(false)
const openCourse = reactive({
  courseScheduleNo: null,
  courseNo: null,
  courseName: null,
  classNo: null,
  className: null,
  teacherNo: null,
  teacherName: null,
  startTime: null,
  endTime: null,
  week: null,
  time: null,
  place: null,
})

function getCourse(course) {
  const weekMap = {
    '1': '星期一',
    '2': '星期二',
    '3': '星期三',
    '4': '星期四',
    '5': '星期五',
    '6': '星期六',
    '7': '星期日'
  }

  const courseCopy = {...course}
  courseCopy.week = weekMap[course.week]

  isOpen.value = true
  Object.assign(openCourse, courseCopy)

}

const addVisible = ref(false)
const addWeek = reactive({
  week: null,
  weekName: null
})
const addTime = ref(null)
const addWeekTime = ref(null)
const addCourse = ref(null)
const addClass = ref(null)
const addPlace = ref(null)

function resetAdd() {
  addCourse.value = null
  addClass.value = null
  addWeekTime.value = null
  addPlace.value = null
}

function addVisibleDisplay(column, record) {
  addTime.value = record.time
  addWeek.weekName = column.title
  addWeek.week = column.key
  addVisible.value = !addVisible.value
}

function addCourseSchedule() {
  if (!addCourse.value || !addClass.value || !addWeekTime.value || !addPlace.value) {
    notification.error({
      message: "错误",
      description: "请填写完整信息"
    })
    return
  }
  const start = dayjs(addWeekTime.value[0])
  const end = dayjs(addWeekTime.value[1])
  const weekStart = start.isoWeek()
  const yearStart = start.year()
  const weekEnd = end.isoWeek()
  const yearEnd = end.year()
  const startTime = `${yearStart}-${weekStart}`
  const endTime = `${yearEnd}-${weekEnd}`

  apiInstance.post("/courseSchedule/add", {
    courseNo: addCourse.value,
    classNo: addClass.value,
    startTime: startTime,
    endTime: endTime,
    week: addWeek.week,
    time: addTime.value,
    place: addPlace.value
  }).then(res => {
    if (res.data.code === code.ADD_SUCCESS) {
      notification.success({
        message: "成功",
        description: res.data.message
      })
      addVisible.value = false
      resetAdd()
      prop.courseScheduleList.push(...res.data.data)
    } else if (res.data.code === code.ADD_FAILED) {
      notification.error({
        message: "错误",
        description: res.data.message
      })
    }
  })
}

const courseData = reactive([])

function getAllCourse() {
  apiInstance.get("/course/all").then(res => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      courseData.splice(0, courseData.length, ...res.data.data)
    }
  })
}

const classData = reactive([])

function getAllClass() {
  apiInstance.get("/class/all").then(res => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      classData.splice(0, classData.length, ...res.data.data)
    }
  })
}

const loginStore = useLoginStore()

function getAll() {
  if (loginStore.userInfo.permissions === 0) {
    getAllCourse()
    getAllClass()
  }
}

getAll()

function deleteCourseSchedule() {
  apiInstance.post("/courseSchedule/delete", {
    courseScheduleNo: openCourse.courseScheduleNo
  }).then(res => {
    if (res.data.code === code.DELETE_SUCCESS) {
      notification.success({
        message: "成功",
        description: res.data.message
      })
      isOpen.value = false
      prop.courseScheduleList.splice(prop.courseScheduleList.findIndex(i => i.courseScheduleNo === openCourse.courseScheduleNo), 1)
    } else if (res.data.code === code.DELETE_FAILED) {
      notification.error({
        message: "错误",
        description: res.data.message
      })
    }
  })
}
</script>

<template>
  <a-table :columns="columns" :dataSource="schedule" :pagination="false" style="margin-top: 15px">
    <template #bodyCell="{ column, record }">
      <template v-if="['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(column.dataIndex)">
        <div style="max-height: 150px; overflow-y: auto;">
          <div v-if="record[column.dataIndex]?.length">
            <div v-for="(course, index) in record[column.dataIndex]" :key="index"
                 style="font-size: 15px; margin-top: 5px; cursor: pointer;border: 1px solid #ccc; border-radius: 6px;padding: 5px"
                 @click="getCourse(course)">
              <div>{{ course.courseName }}</div>
              <div>{{ course.teacherName }}</div>
              <div>{{ course.facultyName }} {{ course.majorName }} {{ course.className }}</div>
              <div>{{ course.place }}室</div>
              <div>{{ course.startTime }}周到{{ course.endTime }}周</div>
            </div>
          </div>
          <div v-else></div>
        </div>
        <div style="position: absolute; top: 5px; right: 5px;cursor: pointer;"
             title="添加课程" @click="addVisibleDisplay(column, record)" v-if="loginStore.userInfo.permissions===0">
          <PlusCircleTwoTone/>
        </div>
      </template>
    </template>
  </a-table>

  <a-modal v-model:open="addVisible" title="添加课程" @ok="addCourseSchedule">
    <a-form-item label="课程">
      <a-select placeholder="请选择课程" v-model:value="addCourse">
        <a-select-option v-for="i in courseData" :key="i.courseNo" :value="i.courseNo">
          {{ i.courseName }}--{{ i.teacherName }}
        </a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item label="班级">
      <a-select placeholder="请选择班级" v-model:value="addClass">
        <a-select-option v-for="i in classData" :key="i.classNo" :value="i.classNo">
          {{ i.facultyName }}--{{ i.majorName }}--{{ i.className }}
        </a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item label="节次">
      <a-select disabled v-model:value="addTime">
        <a-select-option></a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item label="星期">
      <a-select disabled v-model:value="addWeek.weekName">
        <a-select-option></a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item label="周数">
      <a-range-picker picker="week" v-model:value="addWeekTime"/>
    </a-form-item>

    <a-form-item label="地点">
      <a-input v-model:value="addPlace"></a-input>
    </a-form-item>
  </a-modal>

  <a-modal v-model:open="isOpen" title="课程信息">
    <a-descriptions layout="vertical">
      <a-descriptions-item label="课程名">{{ openCourse.courseName }}</a-descriptions-item>
      <a-descriptions-item label="教师姓名">{{ openCourse.teacherName }}</a-descriptions-item>
      <a-descriptions-item label="地点">{{ openCourse.place }}</a-descriptions-item>
      <a-descriptions-item label="班级">{{ openCourse.className }}</a-descriptions-item>
      <a-descriptions-item label="开始时间">{{ openCourse.startTime }}周</a-descriptions-item>
      <a-descriptions-item label="结束时间">{{ openCourse.endTime }}周</a-descriptions-item>
      <a-descriptions-item label="节次">{{ openCourse.time }}</a-descriptions-item>
      <a-descriptions-item label="星期">{{ openCourse.week }}</a-descriptions-item>
      <a-descriptions-item label="操作" v-if="loginStore.userInfo.permissions===0">
        <a-button type="primary" danger @click="deleteCourseSchedule()">删除</a-button>
      </a-descriptions-item>
    </a-descriptions>
  </a-modal>
</template>

<style scoped>

</style>