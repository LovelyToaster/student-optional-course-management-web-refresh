<script setup lang="ts">

import {useLoginStore} from "@/store";
import {reactive, ref} from "vue";
import apiInstance from "@/hooks/api";
import code from "@/hooks/code";
import {notification} from "ant-design-vue";

const prop = defineProps(['taskData'])
const loginStore = useLoginStore()

const isOptional = ref(false)
const tableData = reactive([])
const tableColumns = [
  {
    title: '课程编号',
    dataIndex: 'courseNo',
    key: 'courseNo',
  },
  {
    title: '课程名称',
    dataIndex: 'courseName',
    key: 'courseName',
  }, {
    title: '教师编号',
    dataIndex: 'teacherNo',
    key: 'teacherNo',
  },
  {
    title: '教师名称',
    dataIndex: 'teacherName',
    key: 'teacherName',
  },
  {
    title: '课程学分',
    dataIndex: 'courseGrade',
    key: 'courseGrade',
  },
  {
    title: '课程学时',
    dataIndex: 'courseTime',
    key: 'courseTime',
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action'
  }
]

let currentTask = null

function displayOptional(task) {
  currentTask = task
  isOptional.value = true
  const selectedCourseNo = task.course.split(',') // 转为数组

  tableData.splice(0, tableData.length, ...courseData.filter(course =>
      selectedCourseNo.includes(course.courseNo)
  ))

  tableData.forEach(course => {
    const match = courseOptionalData.find(optional =>
        optional.courseNo === course.courseNo && optional.term === task.term && optional.studentNo === loginStore.userInfo.userName
    )

    course.isOptional = !!match
  })

}

function closeOptional() {
  isOptional.value = false
}

const courseData = reactive([])
const courseOptionalData = reactive([])

function getCourseData() {
  if (loginStore.userInfo.permissions === 2) {
    apiInstance.get("/course/all").then(res => {
      if (res.data.code === code.SEARCH_SUCCESS) {
        courseData.splice(0, courseData.length, ...res.data.data)
      }
    })
    getOptionalData()
  }
}

function getOptionalData() {
  apiInstance.post("/grade/search", {
    studentNo: loginStore.userInfo.userName
  }).then(res => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      courseOptionalData.splice(0, courseOptionalData.length, ...res.data.data)
    }
  })
}

function selectCourse(record) {
  apiInstance.post("/grade/add", {
    studentNo: loginStore.userInfo.userName,
    courseNo: record.courseNo,
    courseTaskNo: currentTask.courseTaskNo
  }).then(res => {
    if (res.data.code === code.ADD_SUCCESS) {
      notification.success({
        message: "成功",
        description: res.data.message
      })
      getOptionalData()
      tableData.forEach(item => {
        if (item.courseNo === record.courseNo) {
          item.isOptional = true
        }
      })
    } else if (res.data.code === code.ADD_FAILED) {
      notification.error({
        message: "错误",
        description: res.data.message
      })
    }
  })
}

function cancelCourse(record) {
  const matched = courseOptionalData.find(item => item.courseNo === record.courseNo)

  apiInstance.post("/grade/delete", {
    studentNo: loginStore.userInfo.userName,
    no: matched.no,
    courseTaskNo: currentTask.courseTaskNo
  }).then(res => {
    if (res.data.code === code.DELETE_SUCCESS) {
      notification.success({
        message: "成功",
        description: res.data.message
      })
      tableData.forEach(item => {
        if (item.courseNo === record.courseNo) {
          item.isOptional = false
        }
      })
    } else if (res.data.code === code.DELETE_FAILED) {
      notification.error({
        message: "错误",
        description: res.data.message
      })
    }
  })
}

getCourseData()
</script>

<template>
  <a-card v-if="taskData.length > 0&& !isOptional" v-for="task in taskData" :key="task.no" style="margin: 15px">
    <template #extra v-if="loginStore.userInfo.permissions===0">
      <a-button type="text" danger size="small">删除</a-button>
    </template>

    <div style="font-weight: bold; font-size: 30px; text-align: center">
      {{ task.term + "学生选课任务" }}
    </div>

    <div style="margin-top: 10px; font-size: 20px; text-align: center">
      选课时间: {{ task.startTime }} 至 {{ task.endTime }}
    </div>

    <div>
      <div style="display: flex; align-items: flex-start; margin-top: 10px">
        <a-tag style="font-size: 15px;" color="blue">选课对象</a-tag>
        <div style="font-size: 15px; margin-left: 15px; flex: 1">{{ task.object }} 级</div>
      </div>

      <div style="display: flex; align-items: flex-start; margin-top: 10px">
        <a-tag style="font-size: 15px;" color="red">注意事项</a-tag>
        <div style="font-size: 15px; margin-left: 15px; flex: 1; word-break: break-word;">
          {{ task.note }}
        </div>
      </div>
    </div>

    <div v-if="loginStore.userInfo.permissions===2" style="text-align: center">
      <a-button v-if="task.status==='进行中'&&task.isLevel" type="primary" style="margin-top: 10px;"
                size="large" @click="displayOptional(task)">
        进入选课
      </a-button>
      <a-button v-else type="primary" disabled style="margin-top: 10px;" size="large">
        未到选课时间或非选课对象
      </a-button>
    </div>

    <div style="margin-top: 15px; font-size: 15px; text-align: right;" :style="{ color: task.color }">
      {{ task.status }}
    </div>
  </a-card>
  <a-result v-if="taskData.length === 0" status="error" title="暂无选课任务"/>

  <div v-if="isOptional" style="margin: 15px;">
    <a-button type="primary" @click="closeOptional">
      返回
    </a-button>
    <a-table style="margin-top: 10px" :columns="tableColumns" :dataSource="tableData"
             :pagination="{ pageSize: 8 }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'action'">
          <a-button v-if="record.isOptional" type="primary" danger @click="cancelCourse(record)">
            取消选课
          </a-button>
          <a-button v-else type="primary" @click="selectCourse(record)">
            选课
          </a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>

<style scoped>

</style>