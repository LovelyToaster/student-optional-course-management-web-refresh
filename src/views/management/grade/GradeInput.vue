<script setup>

import apiInstance from "@/hooks/api";
import {useTeacherStore} from "@/store";
import {computed, reactive, ref} from "vue";
import code from "@/hooks/code";
import {notification} from "ant-design-vue";

const gradeColumns = [
  {
    title: '课程号',
    dataIndex: 'courseNo',
    key: 'courseNo',
  },
  {
    title: '课程名',
    dataIndex: 'courseName',
    key: 'courseName',
  },
  {
    title: '学号',
    dataIndex: 'studentNo',
    key: 'studentNo',
  },
  {
    title: '姓名',
    dataIndex: 'studentName',
    key: 'studentName',
  },
  {
    title: '学分',
    dataIndex: 'displayCoursePoint',
    key: 'displayCoursePoint',
  },
  {
    title: '成绩',
    dataIndex: 'displayGrade',
    key: 'displayGrade',
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
  }
]

function getFilters(key) {
  const values = [...new Set(gradeData.map(item => item[key]))]
  return values.map(val => ({text: String(val), value: val}))
}

const columns = computed(() => {
  return gradeColumns.map(item => {
    if (item.dataIndex !== 'action') {
      return {
        ...item,
        filters: getFilters(item.dataIndex),
        onFilter: (value, record) => record[item.dataIndex] === value,
        filterSearch: true
      }
    }
    return item
  })
})

const teacherStore = useTeacherStore()
const gradeData = reactive([])

function getGrade() {
  apiInstance.post("/grade/search", {
    teacherNo: teacherStore.teacherInfo.teacherNo,
  }).then((res) => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      notification.success({
        message: '成功',
        description: res.data.message
      })
      gradeData.splice(0, gradeData.length, ...res.data.data)
      gradeDisplay()
    } else if (res.data.code === code.SEARCH_FAILED) {
      notification.error({
        message: '失败',
        description: res.data.message
      })
    }
  })
}

function gradeDisplay() {
  gradeData.forEach(item => {
    if (item.grade < 0) {
      item.displayGrade = "暂无"
      item.displayCoursePoint = "暂无"
      item.isGrade = false
    } else {
      item.displayGrade = item.grade
      item.displayCoursePoint = item.coursePoint
      item.isGrade = true
    }
  })
}

const editingKey = ref(null)
const editingGrade = ref(null)

function inputGradeDisplay(record) {
  if (record.isGrade) {
    editingGrade.value = record.grade
  }
  editingKey.value = record.no
}

function inputGrade() {
  apiInstance.post("/grade/modify", {
    grade: editingGrade.value,
    no: editingKey.value
  }).then((res) => {
    if (res.data.code === code.MODIFY_SUCCESS) {
      notification.success({
        message: "成功",
        description: res.data.message
      })
    }
    gradeData.forEach(item => {
      if (item.no === editingKey.value) {
        item.grade = res.data.data.grade
        item.displayGrade = res.data.data.grade
        item.coursePoint = res.data.data.coursePoint
        item.displayCoursePoint = res.data.data.coursePoint
        item.isGrade = false
      }
    })
    editingKey.value = null
  })
}

function cancelInputGrade() {
  editingKey.value = null
}

getGrade()
</script>

<template>
  <div style="margin: 15px">
    <a-table :columns="columns" :dataSource="gradeData">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'action'">
          <a-button v-if="!record.isGrade&&editingKey !== record.no" type="primary" @click="inputGradeDisplay(record)">
            录入
          </a-button>
          <a-button v-if="record.isGrade&&editingKey !== record.no" type="primary" @click="inputGradeDisplay(record)">
            修改成绩
          </a-button>
          <a-button v-if="editingKey === record.no" type="primary" @click="inputGrade">保存</a-button>
          <a-button v-if="editingKey === record.no" type="primary" danger style="margin-left: 5px"
                    @click="cancelInputGrade">取消
          </a-button>
        </template>
        <template v-else>
          <template v-if="editingKey === record.no">
            <a-input-number v-if="column.dataIndex === 'displayGrade'" v-model:value="editingGrade" :min="0"
                            :max="100"/>
          </template>
          <template v-else>
            {{ record[column.dataIndex] }}
          </template>
        </template>
      </template>
    </a-table>
  </div>
</template>

<style scoped>

</style>