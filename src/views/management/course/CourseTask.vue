<script setup lang="ts">
import {reactive, ref} from "vue";
import apiInstance from "@/hooks/api";
import code from "@/hooks/code";
import dayjs from "dayjs";
import {notification} from "ant-design-vue";
import CourseTaskDisplay from "@/components/CourseTaskDisplay.vue";

const addTaskVisible = ref(false)

function addTask() {
  addTaskVisible.value = true
}

const selectData = reactive({
  object: null,
  note: null,
  startTime: null,
  endTime: null,
  term: null,
  course: null
})
const defaultSelectData = {
  object: null,
  note: null,
  startTime: null,
  endTime: null,
  term: null,
  course: null
}
const selectTime = ref([])
const objectArray = ref([])
const courseArray = ref([])

function resetSelectData() {
  selectTime.value = []
  objectArray.value = []
  Object.assign(selectData, defaultSelectData)
}

function addProcessedList(data) {
  const now = dayjs()

  return data.map(task => {
    const start = dayjs(task.startTime)
    const end = dayjs(task.endTime)

    if (now.isBefore(start)) {
      task.status = '未开始'
      task.color = 'gray'
    } else if (now.isAfter(end)) {
      task.status = '已结束'
      task.color = 'red'
    } else {
      task.status = '进行中'
      task.color = 'blue'
    }

    return task
  })
}

function addTaskOk() {
  if (!objectArray) {
    notification.error({
      message: "错误",
      description: "请选择选课对象"
    })
    return
  }
  let sortedData = objectArray.value.map(Number).sort((a, b) => a - b);
  selectData.object = sortedData.join(',')
  if (!courseArray) {
    notification.error({
      message: "错误",
      description: "请选择选课课程"
    })
    return
  }
  sortedData = courseArray.value.map(Number).sort((a, b) => a - b);
  selectData.course = sortedData.join(',')
  if (!selectTime.value[0] || !selectTime.value[1]) {
    notification.error({
      message: "错误",
      description: "请选择开始时间和结束时间"
    })
    return
  }
  selectData.startTime = dayjs(selectTime.value[0]).format('YYYY-MM-DD')
  selectData.endTime = dayjs(selectTime.value[1]).format('YYYY-MM-DD')

  if (!selectData.note) {
    selectData.note = '无'
  }

  const now = dayjs()
  const year = now.year();
  const month = now.month() + 1;

  if (month <= 7) {
    selectData.term = `${year - 1}-${year} 第二学期`;
  } else {
    selectData.term = `${year}-${year + 1} 第一学期`;
  }

  apiInstance.post("/courseTask/add", selectData).then(res => {
    if (res.data.code === code.ADD_SUCCESS) {
      notification.success({
        message: "成功",
        description: res.data.message
      })
      addTaskVisible.value = false
      taskData.push(...addProcessedList([res.data.data]))
    } else if (res.data.code === code.ADD_FAILED) {
      notification.error({
        message: "错误",
        description: res.data.message
      })
    }
    resetSelectData()
  })
}

function addCancel() {
  resetSelectData()
  addTaskVisible.value = false
}

const levelData = reactive([])

function getLevel() {
  apiInstance.get("/student/all").then(res => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      const levels = new Set(res.data.data.data.map(item => item.className.slice(0, 2)))
      levelData.splice(0, levelData.length, ...Array.from(levels))
    }
  })
}

const taskData = reactive([])

function getTask() {
  apiInstance.get("/courseTask/all").then(res => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      notification.success({
        message: "成功",
        description: res.data.message
      })

      taskData.splice(0, taskData.length, ...addProcessedList(res.data.data))
    }
  })
}

const courseData = reactive([])

function getCourse() {
  apiInstance.get("/course/all").then(res => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      courseData.splice(0, courseData.length, ...res.data.data)
    }
  })
}

getLevel()
getTask()
getCourse()
</script>

<template>
  <div style="margin: 15px 0 0 15px">
    <a-button type="primary" size="large" @click="addTask">新增选课任务</a-button>

    <a-modal v-model:open="addTaskVisible" title="新增选课任务" @ok="addTaskOk" @cancel="addCancel">
      <a-form layout="vertical">

        <a-form-item label="选课对象">
          <a-select placeholder="请选择年级" mode="multiple" v-model:value="objectArray">
            <a-select-option v-for="n in levelData" :key="n" :value="n">
              {{ n }} 级
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="选课课程">
          <a-select placeholder="请选择课程" mode="multiple" v-model:value="courseArray">
            <a-select-option v-for="course in courseData" :key="course.courseNo" :value="course.courseNo">
              {{ course.courseName + "--" + course.teacherName }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="注意事项">
          <a-textarea placeholder="请输入注意事项" :rows="3" v-model:value="selectData.note"/>
        </a-form-item>

        <a-form-item label="开始时间">
          <a-range-picker style="width: 100%" v-model:value="selectTime"/>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
  <div>
    <CourseTaskDisplay :taskData="taskData"/>
  </div>
</template>

<style scoped>

</style>