<script setup lang="ts">

import {apiInstance} from "@/hooks/api";
import {useTeacherStore} from "@/store";
import {computed, h, reactive, ref} from "vue";
import code from "@/hooks/code";
import {notification, Progress} from "ant-design-vue";
import {DownloadOutlined, UploadOutlined} from "@ant-design/icons-vue";
import * as XLSX from "xlsx";


const gradeColumns = [
  {
    title: '序号',
    dataIndex: 'no',
    key: 'no',
    excel: {
      name: '序号',
      key: 'no',
      download: 'no'
    }
  },
  {
    title: '课程号',
    dataIndex: 'courseNo',
    key: 'courseNo',
    excel: {
      name: '课程号',
      download: 'courseNo'
    }
  },
  {
    title: '课程名',
    dataIndex: 'courseName',
    key: 'courseName',
    excel: {
      name: '课程名',
      download: 'courseName'
    }
  },
  {
    title: '学号',
    dataIndex: 'studentNo',
    key: 'studentNo',
    excel: {
      name: '学号',
      download: 'studentNo'
    }
  },
  {
    title: '姓名',
    dataIndex: 'studentName',
    key: 'studentName',
    excel: {
      name: '姓名',
      download: 'studentName'
    }
  },
  {
    title: '绩点',
    dataIndex: 'displayCoursePoint',
    key: 'displayCoursePoint',
    excel: {
      name: '绩点',
      download: 'coursePoint',
    }
  },
  {
    title: '平时成绩',
    dataIndex: 'displayUsualGrade',
    key: 'displayUsualGrade',
    excel: {
      name: '平时成绩',
      key: 'usualGrade',
      download: 'usualGrade'
    }
  },
  {
    title: '期末成绩',
    dataIndex: 'displayFinalExamGrade',
    key: 'displayFinalExamGrade',
    excel: {
      name: '期末成绩',
      key: 'finalExamGrade',
      download: 'finalExamGrade'
    }
  },
  {
    title: '总成绩',
    dataIndex: 'displayGrade',
    key: 'displayGrade',
    excel: {
      name: '总成绩',
      download: 'totalGrade',
    }
  },
  {
    title: '学期',
    dataIndex: 'term',
    key: 'term',
    excel: {
      name: '学期',
      download: 'term',
    }
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
const termData = reactive([])

function getGrade() {
  apiInstance.post("/grade/search", {
    teacherNo: teacherStore.teacherInfo.teacherNo,
  }).then((res) => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      notification.success({
        message: '成功',
        description: res.data.message
      })

      const sortedData = res.data.data.sort((a, b) => {
        const parseTerm = (term) => {
          const [yearRange, semester] = term.split(' ')
          const [startYear] = yearRange.split('-').map(Number)
          const semesterOrder = semester === '第一学期' ? 1 : 2
          return startYear * 10 + semesterOrder
        }

        return parseTerm(a.term) - parseTerm(b.term)
      })

      const uniqueTerms = [...new Set(sortedData.map(item => item.term))]

      termData.splice(0, termData.length, ...uniqueTerms)

      gradeData.splice(0, gradeData.length, ...sortedData)
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
    if (item.totalGrade < 0) {
      item.displayUsualGrade = "暂无"
      item.displayFinalExamGrade = "暂无"
      item.displayGrade = "暂无"
      item.displayCoursePoint = "暂无"
      item.isGrade = false
    } else {
      item.displayUsualGrade = item.usualGrade
      item.displayFinalExamGrade = item.finalExamGrade
      item.displayGrade = item.totalGrade
      item.displayCoursePoint = item.coursePoint
      item.isGrade = true
    }
  })
}

const editingKey = ref(null)
const editingGrade = reactive({
  usualGrade: null,
  finalExamGrade: null,
})

function inputGradeDisplay(record) {
  if (record.isGrade) {
    editingGrade.usualGrade = record.usualGrade
    editingGrade.finalExamGrade = record.finalExamGrade
  }
  editingKey.value = record.no
}

function inputGrade() {
  apiInstance.post("/grade/modify", {
    usualGrade: editingGrade.usualGrade,
    finalExamGrade: editingGrade.finalExamGrade,
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
        item.usualGrade = res.data.data.usualGrade
        item.displayUsualGrade = res.data.data.usualGrade
        item.finalExamGrade = res.data.data.finalExamGrade
        item.displayFinalExamGrade = res.data.data.finalExamGrade
        item.grade = res.data.data.totalGrade
        item.displayGrade = res.data.data.totalGrade
        item.coursePoint = res.data.data.coursePoint
        item.displayCoursePoint = res.data.data.coursePoint
        item.isGrade = false
      }
    })
    cancelInputGrade()
  })
}

function cancelInputGrade() {
  editingGrade.value = null
  editingKey.value = null
}

const isExcelDownload = ref(false)

function excelDownloadDisplay() {
  isExcelDownload.value = true
}

function excelDownloadCancel() {
  isExcelDownload.value = false
  excelTerm.value = null
}

const excelTerm = ref(null)

function excelDownload() {
  apiInstance.post("/grade/search", {
    teacherNo: teacherStore.teacherInfo.teacherNo,
    term: excelTerm.value
  }).then((res) => {
    if (res.data.code === code.SEARCH_SUCCESS) {
      res.data.data.forEach(item => {
        if (item.usualGrade === -1) item.usualGrade = '';
        if (item.finalExamGrade === -1) item.finalExamGrade = '';
        if (item.totalGrade === -1) item.totalGrade = '';
        if (item.coursePoint === -1) item.coursePoint = '';
      });

      const headers = gradeColumns.map(col => {
        if (col.dataIndex !== 'action')
          return col.title
      })

      const rows = res.data.data.map(item => {
        return gradeColumns.map(col => item[col.excel?.download])
      })

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

      const wb = XLSX.utils.book_new()
      if (excelTerm.value === null)
        excelTerm.value = "所有"

      XLSX.utils.book_append_sheet(wb, ws, excelTerm.value + "学生成绩")

      XLSX.writeFile(wb, excelTerm.value + "学生成绩" + '.xlsx')
      excelTerm.value = null
    }
    isExcelDownload.value = false
  })
}

getGrade()
</script>

<template>
  <a-modal v-model:open="isExcelDownload" title="Excel下载" @ok="excelDownload" @cancel="excelDownloadCancel">
    <a-form-item label="学期">
      <a-select v-model:value="excelTerm" placeholder="默认为导出所有学期成绩">
        <a-select-option v-for="term in termData" :key="term">{{ term }}</a-select-option>
      </a-select>
    </a-form-item>
  </a-modal>

  <div style="margin: 15px">
    <a-card>
      <a-button type="primary" style="margin-left: 15px" @click="excelDownloadDisplay">
        成绩导出
        <template #icon>
          <DownloadOutlined/>
        </template>
      </a-button>
    </a-card>
    <a-table :columns="columns" :dataSource="gradeData" style="margin-top: 15px">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'action'">
          <a-button v-if="!record.isGrade&&editingKey !== record.no" type="primary" @click="inputGradeDisplay(record)">
            录入成绩
          </a-button>
          <a-button v-if="record.isGrade&&editingKey !== record.no" type="primary" disabled>
            已录入
          </a-button>
          <a-button v-if="editingKey === record.no" type="primary" @click="inputGrade">保存</a-button>
          <a-button v-if="editingKey === record.no" type="primary" danger style="margin-left: 5px"
                    @click="cancelInputGrade">取消
          </a-button>
        </template>
        <template v-else>
          <template v-if="editingKey === record.no">
            <a-input-number v-if="column.dataIndex === 'displayUsualGrade'" v-model:value="editingGrade.usualGrade"
                            :min="0"
                            :max="100"/>
            <a-input-number v-if="column.dataIndex === 'displayFinalExamGrade'"
                            v-model:value="editingGrade.finalExamGrade" :min="0"
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