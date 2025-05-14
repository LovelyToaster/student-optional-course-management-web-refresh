<script setup>
import ManagementPanel from "@/components/ManagementPanel.vue";
import jsonData from "./classTable.json"
import {computed, reactive} from "vue";
import {apiInstance} from "@/hooks/api.js";
import code from "@/hooks/code.js";
import {notification} from "ant-design-vue";

const rawColumns = jsonData.columns
const data = reactive([])
const selectData = reactive({
  major: [],
  faculty: []
})

function getData() {
  apiInstance.get("/class/all").then(res => {
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
  apiInstance.get("/major/all").then(res => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      rawSelectData.major = res.data.data
    }
  })
  apiInstance.get("/faculty/all").then(res => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      selectData.faculty = res.data.data
      rawSelectData.faculty = res.data.data
    }
  })
}

const rawSelectData = reactive({
  major: [],
  faculty: []
})

function selectFilter(select) {
  selectData.major = rawSelectData.major.filter(item => item.facultyNo === select.selectFaculty)
}

getData()
getSelectData()
</script>

<template>
  <div class="studentManagement">
    <ManagementPanel @updateSelectFilter="selectFilter" mark="class" cardTitle="班级信息管理" excelName="班级信息"
                     :columns="columns"
                     :rawData="data" :selectData="selectData"></ManagementPanel>
  </div>
</template>

<style scoped>
.studentManagement {
  margin: 15px;
}
</style>