<script setup lang="ts">
import {apiInstance} from "@/hooks/api";
import {h, reactive, ref} from "vue";
import code from "@/hooks/code";
import {RestOutlined, SearchOutlined} from "@ant-design/icons-vue";
import {notification} from "ant-design-vue";
import {useLoginStore} from "@/store";
import {useRouter} from "vue-router";

const columns = [
  {
    title: '用户名',
    dataIndex: 'userName',
    key: 'userName',
  },
  {
    title: '姓名',
    dataIndex: 'realName',
    key: 'realName',
  },
  {
    title: '权限',
    dataIndex: 'permissions',
    key: 'permissions',
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
  },
];

const tableData = reactive([])
const permissionMap = {
  0: '管理员',
  1: '教师',
  2: '学生'
}

function getAllUsers() {
  apiInstance.get("/user/all")
      .then(res => {
        if (res.data.code === code.SEARCH_SUCCESS) {
          notification.success({
            message: '成功',
            description: res.data.message
          })
          tableData.splice(0, tableData.length, ...res.data.data)
        }
      })
}

const editingRecord = reactive({
  userName: null,
  permissions: null
})

function edit(record) {
  editingRecord.userName = record.userName
  editingRecord.permissions = record.permissions
}


function cancel() {
  editingRecord.userName = null
  editingRecord.permissions = null
}

const isSearch = ref(false)
const searchData = reactive({
  userName: null,
  realName: null,
  permissions: null
})
const defaultSearchData = {
  userName: null,
  realName: null,
  permissions: null
}

function searchOpen() {
  isSearch.value = true
}

function searchClose() {
  isSearch.value = false
  Object.assign(searchData, defaultSearchData)
}

function resetSearchData() {
  apiInstance.get("/user/all")
      .then(res => {
        if (res.data.code === code.SEARCH_SUCCESS) {
          tableData.splice(0, tableData.length, ...res.data.data)
        }
      })
}

function getSearchUsers() {
  apiInstance.post("/user/search", searchData)
      .then(res => {
        if (res.data.code === code.SEARCH_SUCCESS) {
          notification.success({
            message: '成功',
            description: res.data.message
          })
          tableData.splice(0, tableData.length, ...res.data.data)
          searchClose()
        }
      })
}

const loginStore = useLoginStore()
const router = useRouter()

function setPermissions() {
  apiInstance.post("/user/setPermissions", {
    userName: editingRecord.userName,
    permissions: editingRecord.permissions
  })
      .then(res => {
        if (res.data.code === code.MODIFY_SUCCESS) {
          notification.success({
            message: '成功',
            description: res.data.message
          })
          tableData.forEach(item => {
            if (item.userName === editingRecord.userName) {
              item.permissions = editingRecord.permissions
            }
          })
          if (loginStore.userInfo.userName === editingRecord.userName) {
            loginStore.userInfo.permissions = editingRecord.permissions
            apiInstance.get("/user/loginOut")
                .then(res => {
                  if (res.data.code === code.LOGIN_OUT_SUCCESS) {
                    notification.success({
                      message: "成功",
                      description: "当前用户权限被修改，即将返回登录界面"
                    })
                    setTimeout(() => {
                      router.push({path: "/login"})
                    }, 3000)
                  }
                })
          }

        } else if (res.data.code === code.MODIFY_FAILED) {
          notification.error({
            message: '失败',
            description: res.data.message
          })
        }
        cancel()
      })
}

getAllUsers()
</script>

<template>
  <div style="margin: 15px">
    <a-card>
      <a-button type="primary" :icon="h(SearchOutlined)" @click="searchOpen">查询</a-button>
      <a-button type="primary" :icon="h(RestOutlined)" style="margin-left: 15px" @click="resetSearchData"/>
    </a-card>
    <a-table :columns="columns" :dataSource="tableData" style="margin-top: 15px" :pagination="{ pageSize: 8 }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'permissions'">
          <template v-if="editingRecord && editingRecord.userName === record.userName">
            <a-radio-group v-model:value="editingRecord.permissions">
              <a-radio :value="0">管理员</a-radio>
              <a-radio :value="1">教师</a-radio>
            </a-radio-group>
          </template>
          <template v-else>
            {{ permissionMap[record.permissions] }}
          </template>
        </template>
        <template v-else-if="column.dataIndex === 'action'">
          <template v-if="editingRecord && editingRecord.userName === record.userName">
            <a-button type="primary" @click="setPermissions">保存</a-button>
            <a-button style="margin-left: 8px" @click="cancel">取消</a-button>
          </template>
          <template v-else>
            <a-button type="primary" :disabled="record.permissions === 2" @click="edit(record)">
              修改
            </a-button>
          </template>
        </template>
      </template>
    </a-table>
  </div>

  <a-modal v-model:open="isSearch" title="用户查询" @cancel="searchClose" @ok="getSearchUsers">
    <a-form>
      <a-form-item label="用户名">
        <a-input v-model:value="searchData.userName"/>
      </a-form-item>
      <a-form-item label="姓名">
        <a-input v-model:value="searchData.realName"/>
      </a-form-item>
      <a-form-item label="权限">
        <a-radio-group v-model:value="searchData.permissions">
          <a-radio :value="0">管理员</a-radio>
          <a-radio :value="1">教师</a-radio>
          <a-radio :value="2">学生</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<style scoped>

</style>