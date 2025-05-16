<script setup lang="ts">
import {UserOutlined, EditOutlined, KeyOutlined, MailOutlined} from '@ant-design/icons-vue'
import {ref} from "vue";
import {useLoginStore, useStudentStore, useTeacherStore} from "@/store";
import 'vue-cropper/dist/index.css'
import {notification} from "ant-design-vue";
import {apiInstance} from "@/hooks/api";
import code from "@/hooks/code";
import {useRouter} from "vue-router";
import {VueCropper} from 'vue-cropper'

const loginStore = useLoginStore();
const teacherStore = useTeacherStore();
const studentStore = useStudentStore();
const isCopper = ref(false)
const cropper = ref()

const teacherTable = [
  {
    name: "编号",
    key: "teacherNo"
  },
  {
    name: "姓名",
    key: "teacherName"
  },
  {
    name: "性别",
    key: "teacherSex"
  },
  {
    name: "年龄",
    key: "teacherAge"
  },
  {
    name: "学历",
    key: "teacherDegree"
  },
  {
    name: "职称",
    key: "teacherJob"
  },
  {
    name: "所属院系",
    key: "facultyName"
  },
  {
    name: "毕业院校",
    key: "teacherGraduateInstitutions"
  }, {
    name: "邮箱",
    key: "email"
  }
]

const studentTable = [
  {
    name: "学号",
    key: "studentNo"
  },
  {
    name: "姓名",
    key: "studentName"
  },
  {
    name: "性别",
    key: "studentSex"
  },
  {
    name: "年龄",
    key: "studentAge"
  },
  {
    name: "学院",
    key: "facultyName"
  },
  {
    name: "班级",
    key: "className"
  }, {
    name: "邮箱",
    key: "email"
  }
]

let data = null
let dataSpinning = ref(true)

function getUserData() {
  if (loginStore.userInfo.permissions === 0 || loginStore.userInfo.permissions === 1) {
    data = teacherStore.teacherInfo
    dataSpinning.value = false
  } else if (loginStore.userInfo.permissions === 2) {
    data = studentStore.studentInfo
    dataSpinning.value = false
  }
}

const base64Avatar = ref(null)

function handleBeforeUpload(file) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    notification.error({
      message: '错误',
      description: '请上传正确的图片'
    })
    return false
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    base64Avatar.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  isCopper.value = true

  return false
}

function confirmCropper() {
  cropper.value.getCropBlob((blob) => {
    const file = new File([blob], 'avatar.jpg', {type: 'image/jpg'})
    const formData = new FormData()
    formData.append('file', file)
    apiInstance.post('/user/setAvatar', formData)
        .then(res => {
          if (res.data.code === code.MODIFY_SUCCESS) {
            notification.success({
              message: '成功',
              description: res.data.message
            })
            loginStore.userInfo.avatarPath = res.data.data + '?t=' + new Date().getTime()
          } else if (res.data.code === code.MODIFY_FAILED) {
            notification.error({
              message: '错误',
              description: res.data.message
            })
          }
          isCopper.value = false
        })
        .catch(e => {
          notification.error({
            message: '错误',
            description: e.data.message
          })
        })
  })
}

const router = useRouter()
const activeTabKey = ref('1')
const nowPassword = ref(null)
const newPassword = ref(null)
const newPasswordConfirm = ref(null)

function changePassword() {
  if (nowPassword.value === null || nowPassword.value === '' || newPassword.value === null || newPassword.value === '') {
    notification.error({
      message: '错误',
      description: '请输入完整信息'
    })
    return
  }
  if (newPassword.value !== newPasswordConfirm.value) {
    notification.error({
      message: '错误',
      description: '两次输入的密码不一致'
    })
    return
  }

  apiInstance.post("/user/setPassword", {
    userName: loginStore.userInfo.userName,
    userPassword: nowPassword.value,
    newPassword: newPassword.value
  }).then(res => {
    if (res.data.code === code.MODIFY_SUCCESS) {
      notification.success({
        message: '成功',
        description: res.data.message
      })
      resetPassword()
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } else if (res.data.code === code.MODIFY_FAILED) {
      notification.error({
        message: '错误',
        description: res.data.message
      })
    }
  }).catch(e => {
    notification.error({
      message: '错误',
      description: e.data.message
    })
  })
}

function resetPassword() {
  nowPassword.value = null
  newPassword.value = null
  newPasswordConfirm.value = null
}

const nowEmail = ref(null)
const newEmail = ref(null)
const emailCode = ref(null)
const sendLoading = ref(false)

function emailVerify(email) {
  const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (!emailRegex.test(email)) {
    notification.error({
      message: '错误',
      description: '请输入正确的邮箱'
    })
    return false
  }
  return true
}

function sendCode() {
  if (!emailVerify(nowEmail.value)) return
  sendLoading.value = true
  apiInstance.post("/user/emailSend", {
    email: nowEmail.value
  }).then(res => {
    if (res.data.code === code.EMAIL_SEND_SUCCESS) {
      notification.success({
        message: '成功',
        description: res.data.message
      })
    } else if (res.data.code === code.EMAIL_SEND_TOO_FREQUENT) {
      notification.error({
        message: '错误',
        description: res.data.message
      })
    }
    sendLoading.value = false
  }).catch(e => {
    sendLoading.value = false
  })
}

function changeEmail() {
  if (!emailVerify(nowEmail.value)) return
  if (!emailVerify(newEmail.value)) return

  apiInstance.post("/user/setEmail", {
    email: nowEmail.value,
    code: emailCode.value,
    newEmail: newEmail.value
  }).then(res => {
    if (res.data.code === code.CODE_VERIFY_SUCCESS) {
      notification.success({
        message: '成功',
        description: res.data.message
      })
      if (loginStore.userInfo.permissions === 2) {
        studentStore.studentInfo.email = newEmail.value
      } else {
        teacherStore.teacherInfo.email = newEmail.value
      }
      activeTabKey.value = '1'
      resetEmail()
    }
    if (res.data.code === code.CODE_VERIFY_FAILED) {
      notification.error({
        message: '错误',
        description: res.data.message
      })
    }
  }).catch(e => {
    notification.error({
      message: '错误',
      description: e.data.message
    })
  })
}

function resetEmail() {
  nowEmail.value = null
  newEmail.value = null
  emailCode.value = null
}

function initEmail() {
  if (!emailVerify(nowEmail.value)) return
  apiInstance.post("/user/initEmail", {
    userName: loginStore.userInfo.userName,
    email: nowEmail.value
  }).then(res => {
    if (res.data.code === code.EMAIL_SET_SUCCESS) {
      notification.success({
        message: '成功',
        description: res.data.message
      })
      if (loginStore.userInfo.permissions === 2) {
        studentStore.studentInfo.email = nowEmail.value
      } else {
        teacherStore.teacherInfo.email = nowEmail.value
      }
      resetEmail()
    } else if (res.data.code === code.EMAIL_REPEAT) {
      notification.error({
        message: '错误',
        description: res.data.message
      })
    }
  }).catch(e => {
    notification.error({
      message: '错误',
      description: e.data.message
    })
  })
}

getUserData()


</script>

<template>
  <div class="userCenter">
    <div style="flex: 1;display: flex">
      <a-card style="margin-right:15px;flex: 1;display: flex"
              :bodyStyle="{ width: '100%', textAlign: 'center' }">
        <div class="avatar-upload-wrapper">
          <a-upload accept="image/*" :show-upload-list="false" :beforeUpload="handleBeforeUpload">
            <div class="avatar-container">
              <a-avatar :size="150" :src="loginStore.userInfo.avatarPath">
                <template #icon>
                  <UserOutlined/>
                </template>
              </a-avatar>
              <EditOutlined class="edit-icon"/>
            </div>
          </a-upload>
        </div>
        <a-modal v-model:open="isCopper" title="修改头像" width="50vw" @ok="confirmCropper">
          <div style="width: 100%;height: 50vh">
            <vueCropper ref="cropper" :img="base64Avatar" :canMove="false" :autoCrop="true"></vueCropper>
          </div>
        </a-modal>
        <div class="info">
          <div>姓名: {{
              loginStore.userInfo.permissions === 2 ? studentStore.studentInfo.studentName : teacherStore.teacherInfo.teacherName
            }}
          </div>
          <div v-if="loginStore.userInfo.permissions===1">编号: {{ teacherStore.teacherInfo.teacherNo }}</div>
          <div v-if="loginStore.userInfo.permissions===2">学号: {{ studentStore.studentInfo.studentNo }}</div>
        </div>
      </a-card>
      <a-card style="flex: 3" title="个人信息">
        <a-spin :spinning="dataSpinning">
          <a-descriptions bordered>
            <template v-for="label in loginStore.userInfo.permissions === 2 ? studentTable : teacherTable">
              <a-descriptions-item :label="label.name">
                {{ data[label.key] }}
              </a-descriptions-item>
            </template>
          </a-descriptions>
        </a-spin>
      </a-card>
    </div>
    <div style="flex: 1">
      <a-card style="margin-top: 15px" :bodyStyle="{ width: '100%'}">
        <a-tabs v-model:activeKey="activeTabKey">
          <a-tab-pane key="1">
            <template #tab>
              <KeyOutlined style="margin-right: 5px"/>
              修改密码
            </template>
            <div style="width: 20%">
              <a-input-password placeholder="请输入当前密码" class="disableEye"
                                v-model:value="nowPassword"></a-input-password>
              <a-input-password placeholder="请输入新的密码" class="disableEye"
                                v-model:value="newPassword"></a-input-password>
              <a-input-password placeholder="请再次输入新的密码" class="disableEye"
                                v-model:value="newPasswordConfirm"></a-input-password>
            </div>
            <a-button type="primary" style="margin-top: 15px" @click="changePassword()">修改</a-button>
            <a-button type="primary" danger style="margin:15px 0 0 15px" @click="resetPassword()">重置</a-button>
          </a-tab-pane>
          <a-tab-pane key="2"
                      v-if="loginStore.userInfo.permissions === 2?studentStore.studentInfo.email!=null:teacherStore.teacherInfo.email!=null">
            <template #tab>
              <MailOutlined style="margin-right: 5px"/>
              修改邮箱
            </template>
            <div style="width: 20%">
              <a-form>
                <a-input placeholder="请输入当前邮箱" style="margin-top: 15px" v-model:value="nowEmail"></a-input>
                <div style="display: flex;margin-top: 15px">
                  <a-input placeholder="请输入验证码" v-model:value="emailCode"></a-input>
                  <a-button type="primary" style="margin-left: 5px" @click="sendCode()" :loading="sendLoading">发送验证码
                  </a-button>
                </div>
                <a-input placeholder="请输入新的邮箱" style="margin-top: 15px" v-model:value="newEmail"></a-input>
                <a-button type="primary" style="margin-top: 15px" @click="changeEmail()">修改</a-button>
                <a-button type="primary" danger style="margin:15px 0 0 15px" @click="resetEmail()">重置</a-button>
              </a-form>
            </div>
          </a-tab-pane>
          <a-tab-pane key="3"
                      v-if="loginStore.userInfo.permissions === 2?studentStore.studentInfo.email===null||studentStore.studentInfo.email==='':teacherStore.teacherInfo.email===null||teacherStore.teacherInfo.email===''">
            <template #tab>
              <MailOutlined style="margin-right: 5px"/>
              设置默认邮箱
            </template>
            <div style="width: 20%">
              <a-form>
                <a-input placeholder="请输入邮箱" style="margin-top: 15px" v-model:value="nowEmail"></a-input>
                <div style="display: flex;margin-top: 15px">
                  <a-input placeholder="请输入验证码" v-model:value="emailCode"></a-input>
                  <a-button type="primary" style="margin-left: 5px" @click="sendCode()" :loading="sendLoading">发送验证码
                  </a-button>
                </div>
                <a-button type="primary" style="margin-top: 15px" @click="initEmail()">修改</a-button>
                <a-button type="primary" danger style="margin:15px 0 0 15px" @click="resetEmail()">重置</a-button>
              </a-form>
            </div>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
  </div>
</template>

<style scoped>
.userCenter {
  margin: 15px;
  display: flex;
  flex-direction: column;
}

.info div {
  margin-top: 25px;
  font-size: 15px;
  font-weight: bold;
}

.avatar-upload-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.edit-icon {
  position: absolute;
  font-size: 20px;
  background: white;
  cursor: pointer;
  color: cornflowerblue;
}

.disableEye {
  margin-top: 15px;
}

.disableEye ::-ms-reveal {
  display: none;
}
</style>