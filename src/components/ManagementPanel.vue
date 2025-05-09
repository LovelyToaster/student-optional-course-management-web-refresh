<script setup lang="ts">
import {DeleteOutlined, DownloadOutlined, UploadOutlined} from '@ant-design/icons-vue'
import * as XLSX from 'xlsx'
import {computed, h, reactive, ref, toRaw, watch} from "vue";
import {notification, Progress} from "ant-design-vue";
import apiInstance from "@/hooks/api";
import code from "@/hooks/code";

const prop = defineProps(['mark', 'cardTitle', 'excelName', 'columns', 'rawData', 'selectData'])

const data = reactive([])

watch(
    () => prop.rawData,
    (newData) => {
      data.length = 0
      data.push(...newData.map((item, index) => ({
        ...item,
        key: index.toString(),
      })))
    },
    {immediate: true, deep: true}
)

watch(
    data,
    (newVal) => {
      newVal.sort((a, b) => a[prop.columns[0].dataIndex] - b[prop.columns[0].dataIndex])
    },
    {deep: true}
)

const addColumns = computed(() =>
    prop.columns.filter(field => field.key !== 'action')
)

function excelDownload() {
  const headers = prop.columns.map(col => {
    if (col.dataIndex !== 'action')
      return col.title
  })

  const rows = prop.rawData.map(item => {
    return prop.columns.map(col => item[col.dataIndex])
  })

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, prop.excelName)

  XLSX.writeFile(wb, prop.excelName + '.xlsx')
}

const addVisible = ref(false)

function addInfo() {
  addVisible.value = true
}

function customRequest({file, onSuccess, onError}) {
  notification.info({
    message: '文件上传中',
    description: '正在解析并上传文件，请稍候...',
    duration: null,
    key: 'excelUpload'
  });

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const excelData = new Uint8Array(e.target.result as ArrayBuffer);
      const workbook = XLSX.read(excelData, {type: 'array'});

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rows = XLSX.utils.sheet_to_json(worksheet, {header: 1}); // 得到二维数组
      const header = rows[0];
      const body = rows.slice(1);

      const headerMap = {}

      prop.columns.forEach(f => {
        if (f.excel?.name && f.excel?.key) {
          headerMap[f.excel.name] = f.excel.key;
        }
      });

      const isValid = Object.keys(headerMap).every(key => (header as string[]).includes(key));
      if (!isValid) {
        notification.error({
          message: '上传失败',
          description: 'Excel 表头不正确，必须包含：' + Object.keys(headerMap).join('、'),
          key: 'excelUpload'
        });
        onError(new Error('表头不符合要求'));
        return;
      }

      const indexMap = {};
      for (const key in headerMap) {
        indexMap[headerMap[key]] = (header as string[]).indexOf(key);
      }

      let processedRows = 0;
      const totalRows = body.length;

      const jsonData = body.map(row => {
        const item = {};
        for (const key in indexMap) {
          item[key] = row[indexMap[key]] ?? '';
          processedRows++;
          const progress = Math.round((processedRows / totalRows) * 100);
          notification.info({
            message: '文件上传中',
            description: h(Progress, {
              percent: progress,
              status: 'active',
              showInfo: true
            }),
            duration: null,
            key: 'excelUpload'
          });
        }
        return item;
      });

      apiInstance.post(`/${prop.mark}/batchAdd`, jsonData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
          .then((response) => {
            notification.success({
              message: '上传成功',
              description: response.data.message,
              key: 'excelUpload'
            });
            onSuccess(response.data);
            const addData = response.data.data.flat();

            data.push(...addData);
          })
          .catch((error) => {
            notification.error({
              message: '上传失败',
              description: '上传过程中出错',
              key: 'excelUpload'
            });
            onError(error);
          });

    } catch (err) {
      notification.error({
        message: '解析失败',
        description: 'Excel 文件解析失败',
        key: 'excelUpload'
      });
      onError(err);
    }
  };

  reader.onerror = (err) => {
    notification.error({
      message: '读取失败',
      description: '无法读取文件内容',
      key: 'excelUpload'
    });
    onError(err);
  };

  reader.readAsArrayBuffer(file);
}

const handleUpload = (file) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel';

  if (!isExcel) {
    notification.error({
      message: '错误',
      description: '请上传Excel文件'
    })
  }

  return isExcel;
};

const addData = reactive<any>({})

function addInfoSubmit() {
  if (Object.keys(toRaw(addData)).length !== addColumns.value.length - 1) {
    notification.error({
      message: '错误',
      description: '请填写完整信息'
    })
    return
  }

  apiInstance.post(`/${prop.mark}/add`, addData).then(res => {
    if (res.data.code === code.ADD_SUCCESS) {
      notification.success({
        message: '成功',
        description: res.data.message
      })
      const newData = res.data.data
      data.push(...newData.map((item, index) => ({
        ...item,
        key: index.toString(),
      })))
    } else {
      notification.error({
        message: '错误',
        description: res.data.message
      })
    }
    Object.keys(addData).forEach(key => {
      delete addData[key]
    })

  })
  addVisible.value = false
}

function cancelAdd() {
  Object.keys(addData).forEach(key => {
    delete addData[key]
  })
  addVisible.value = false
}

const selectedRowKeys = ref([])
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (newSelectedRowKeys) => {
    selectedRowKeys.value = newSelectedRowKeys
  }
}))

function batchDelete() {
  if (selectedRowKeys.value.length === 0) {
    notification.error({
      message: '错误',
      description: '请选择要删除的数据'
    })
    return
  }

  const jsonData = selectedRowKeys.value.map(no => ({
    [prop.columns[0].key]: no
  }));

  apiInstance.post(`/${prop.mark}/batchDel`, jsonData, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
      .then(res => {
        if (res.data.code === code.DELETE_SUCCESS) {
          notification.success({
            message: '成功',
            description: res.data.message
          })
          const filteredData = data.filter(item =>
              !res.data.data.includes(item[prop.columns[0].key])
          );

          data.splice(0, data.length, ...filteredData);
          selectedRowKeys.value = []
        } else {
          notification.error({
            message: '错误',
            description: res.data.message
          })
        }
      })
}

const editingKey = ref(null)
const editingData = reactive<any>({});

function editRow(record) {
  Object.assign(editingData, record)
  editingKey.value = record.key
}

function saveRow() {
  const isValid = Object.values(editingData).every(value => value !== '' && value !== null && value !== undefined);

  if (!isValid) {
    notification.error({
      message: '错误',
      description: '请填写完整信息'
    })
    return
  }

  apiInstance.post(`/${prop.mark}/modify`, editingData).then(res => {
    if (res.data.code === code.MODIFY_SUCCESS) {
      notification.success({
        message: '成功',
        description: res.data.message
      })
      prop.columns.forEach(col => {
        if (col.input?.type === 'select' && col.select) {
          const {name: selectName, option: labelKey, optionKey: valueKey} = col.select;

          const selectedList = prop.selectData[selectName];
          const selectedValue = editingData[valueKey];

          if (selectedList && selectedValue !== undefined) {
            const match = selectedList.find(item => item[valueKey] === selectedValue);
            if (match) {
              editingData[labelKey] = match[labelKey];
            }
          }
        }
      });
      const index = data.findIndex(item => item.key === editingKey.value);
      if (index !== -1)
        Object.assign(data[index], editingData)
    } else if (res.data.code === code.MODIFY_FAILED) {
      notification.error({
        message: '错误',
        description: res.data.message
      })
    }
    editingKey.value = null
  })
}

function deleteRow(record) {
  apiInstance.post(`/${prop.mark}/delete`, {
    [prop.columns[0].dataIndex]: record[prop.columns[0].dataIndex]
  }).then(res => {
    if (res.data.code === code.DELETE_SUCCESS) {
      notification.success({
        message: '成功',
        description: res.data.message
      })
      const index = data.findIndex(item => item[prop.columns[0].dataIndex] === record[prop.columns[0].dataIndex])
      if (index !== -1) {
        data.splice(index, 1)
      }
    } else {
      notification.error({
        message: '错误',
        description: res.data.message
      })
    }
  })
}

function cancelEdit() {
  editingKey.value = null
}

function tableChange() {
  editingKey.value = null
}

function checkSelectOption() {
  const optionKeys = prop.columns
      .map(col => col.select?.optionKey)
      .filter(Boolean)

  return {
    isFaculty: optionKeys.includes('facultyNo'),
    isMajor: optionKeys.includes('majorNo'),
    isClass: optionKeys.includes('classNo')
  }
}

function selectChange(value, option) {
  const verify = checkSelectOption()
  if (verify.isFaculty && verify.isMajor && verify.isClass)
    if (option.facultyNo && !option.majorNo) {
      selectFilter.selectFaculty = option.facultyNo
      editingData.majorNo = null
      editingData.classNo = null
    }
  if (verify.isMajor && verify.isClass)
    if (option.majorNo && !option.classNo) {
      selectFilter.selectMajor = option.majorNo
      editingData.classNo = null
    }
}

function addSelectChange(value, option) {
  const verify = checkSelectOption()
  if (verify.isFaculty && verify.isMajor && verify.isClass)
    if (option.facultyNo && !option.majorNo) {
      selectFilter.selectFaculty = option.facultyNo
      addData.majorNo = null
      addData.classNo = null
    }
  if (verify.isMajor && verify.isClass)
    if (option.majorNo && !option.classNo) {
      selectFilter.selectMajor = option.majorNo
      addData.classNo = null
    }
}

const emit = defineEmits(['updateSelectFilter'])

const selectFilter = reactive({
  selectFaculty: '',
  selectMajor: '',
})

watch(selectFilter, (newVal) => {
  emit('updateSelectFilter', {...newVal})
}, {deep: true})

watch(
    () => ({
      facultyNo: editingData.facultyNo,
      majorNo: editingData.majorNo
    }),
    (newVal) => {
      selectFilter.selectFaculty = newVal.facultyNo
      selectFilter.selectMajor = newVal.majorNo
    }
)
watch(
    () => ({
      facultyNo: addData.facultyNo,
      majorNo: addData.majorNo
    }),
    (newVal) => {
      selectFilter.selectFaculty = newVal.facultyNo
      selectFilter.selectMajor = newVal.majorNo
    }
)


</script>

<template>
  <a-card :title="cardTitle">
    <a-button type="primary" @click="addInfo">添加信息</a-button>
    <a-upload style="margin-left: 15px " :show-upload-list="false" accept=".xlsx" :beforeUpload="handleUpload"
              :customRequest="customRequest">
      <a-button type="primary">
        Excel批量上传
        <template #icon>
          <UploadOutlined/>
        </template>
      </a-button>
    </a-upload>
    <a-button type="primary" style="margin-left: 15px" @click="excelDownload">
      Excel表格下载
      <template #icon>
        <DownloadOutlined/>
      </template>
    </a-button>
    <a-popconfirm title="确定删除吗" @confirm="batchDelete">
      <a-button type="primary" danger style="margin-left: 15px">
        批量删除
        <template #icon>
          <DeleteOutlined/>
        </template>
      </a-button>
    </a-popconfirm>
  </a-card>
  <a-modal v-model:open="addVisible" title="添加信息" @ok="addInfoSubmit" @cancel="cancelAdd">
    <a-form-item
        v-for="col in addColumns"
        :key="col.key"
        :label="col.title"
    >
      <a-input v-if="col.input.type === 'input'" :disabled="col.input.disabled" :defaultValue="col.input.defaultValue"
               v-model:value="addData[col.dataIndex]"/>

      <a-input-number v-else-if="col.input.type === 'number'" :min="col.input.options.min"
                      :max="col.input.options.max" v-model:value="addData[col.dataIndex]"/>

      <a-radio-group v-else-if="col.input.type === 'radio'" v-model:value="addData[col.dataIndex]">
        <a-radio v-for="option in col.input.options" :key="option" :value="option">
          {{ option }}
        </a-radio>
      </a-radio-group>

      <a-select v-else-if="col.input.type === 'select'" :placeholder="col.input.placeholder"
                v-model:value="addData[col.select.optionKey]" show-search style="width: 100%"
                :field-names="{ label: col.select.option, value: col.select.optionKey }"
                :options="selectData[col.select.name]" @change="addSelectChange">
      </a-select>
    </a-form-item>
  </a-modal>
  <a-table style="margin-top: 15px" :columns="columns" :dataSource="data" :pagination="{ pageSize: 8 }"
           @change="tableChange" :rowSelection="rowSelection" :rowKey="columns[0].key">
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'action'">
        <a-button
            v-if="editingKey !== record.key"
            type="primary"
            size="small"
            @click="editRow(record)">编辑
        </a-button>
        <a-popconfirm v-if="editingKey !== record.key" title="确定删除吗？" @confirm="deleteRow(record)">
          <a-button
              v-if="editingKey !== record.key"
              type="primary"
              danger
              size="small"
              style="margin-left: 8px">
            删除
          </a-button>
        </a-popconfirm>
        <a-button
            v-if="editingKey === record.key"
            type="primary"
            size="small"
            @click="saveRow()">
          保存
        </a-button>
        <a-button
            v-if="editingKey === record.key"
            type="primary"
            danger
            size="small"
            style="margin-left: 8px"
            @click="cancelEdit">取消
        </a-button>
      </template>

      <template v-else>
        <template v-if="editingKey === record.key">

          <a-input v-if="column.input.type === 'input'" :disabled="column.input.disabled" size="small"
                   v-model:value="editingData[column.dataIndex]"/>

          <a-input-number v-else-if="column.input.type === 'number'" :min="column.input.options.min"
                          :max="column.input.options.max" v-model:value="editingData[column.dataIndex]"/>

          <a-radio-group v-else-if="column.input.type === 'radio'" v-model:value="editingData[column.dataIndex]">
            <a-radio v-for="option in column.input.options" :key="option" :value="option">
              {{ option }}
            </a-radio>
          </a-radio-group>

          <a-select v-else-if="column.input.type === 'select'" :placeholder="column.input.placeholder"
                    v-model:value="editingData[column.select.optionKey]" show-search style="width: 100%"
                    :field-names="{ label: column.select.option, value: column.select.optionKey }"
                    :options="selectData[column.select.name]" @change="selectChange">
          </a-select>

        </template>
        <template v-else>
          {{ record[column.dataIndex] }}
        </template>
      </template>
    </template>
  </a-table>
</template>

<style scoped>

</style>