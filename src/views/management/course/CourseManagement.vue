<script setup>
import ManagementPanel from "@/components/ManagementPanel.vue";
import jsonData from "./courseTable.json"
import {computed, reactive} from "vue";
import {apiInstance} from "@/hooks/api.js";
import code from "@/hooks/code.js";
import {notification} from "ant-design-vue";

const rawColumns = jsonData.columns
const data = reactive([])
const selectData = reactive({
  teacher: [],
})

function getData() {
  apiInstance.get("/course/all").then(res => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      Object.assign(data, res.data.data)
      notification.success({
        message: '查询成功',
        description: res.data.message
      })
    }
  })
}

function getFilters(key) {
  const values = [...new Set(data.map(item => item[key]))]
  return values.map(val => ({text: String(val), value: val}))
}

const columns = computed(() => {
  return rawColumns.map(item => {
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

function getSelectData() {
  apiInstance.get("/teacher/all").then(res => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      selectData.teacher = res.data.data.data
    }
  })
}

getData()
getSelectData()
</script>

<template>
  <div class="studentManagement">
    <ManagementPanel mark="course" cardTitle="课程信息管理" excelName="课程信息"
                     :columns="columns"
                     :rawData="data" :selectData="selectData"></ManagementPanel>
  </div>
</template>

<style scoped>
.studentManagement {
  margin: 15px;
}
</style>