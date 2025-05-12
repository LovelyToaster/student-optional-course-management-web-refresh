<script setup lang="ts">

import CourseTaskDisplay from "@/components/CourseTaskDisplay.vue";
import apiInstance from "@/hooks/api";
import code from "@/hooks/code";
import {reactive} from "vue";
import {notification} from "ant-design-vue";
import dayjs from "dayjs";
import {useStudentStore} from "@/store";

const taskData = reactive([])
const studentStore = useStudentStore()

function addProcessedList(data) {

  return data.map(task => {
    const now = dayjs()
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

    if (task.object) {
      const classLevel = studentStore.studentInfo.className.slice(0, 2)
      const objectArray = task.object.split(',')
      task.isLevel = objectArray.includes(classLevel)
    } else {
      task.isLevel = false
    }

    return task
  })
}

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

getTask()
</script>

<template>
  <CourseTaskDisplay :taskData="taskData"/>
</template>

<style scoped>

</style>