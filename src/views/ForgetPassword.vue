<script setup lang="ts">
import {RollbackOutlined} from '@ant-design/icons-vue'
import {useRouter} from "vue-router";
import {ref} from "vue";
import {notification} from "ant-design-vue";
import {apiInstance} from "@/hooks/api";
import code from "@/hooks/code";

const router = useRouter()
const passwordForm = ref(true)
const passwordSuccess = ref(false)
const sendLoading = ref(false)
const email = ref(null)
const emailCode = ref(null)
const newPassword = ref(null)
const confirmNewPassword = ref(null)

function backToLogin() {
  router.push("/login")
}

function emailVerify() {
  const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (!emailRegex.test(email.value)) {
    notification.error({
      message: '错误',
      description: '请输入正确的邮箱'
    })
    return false
  }
  return true
}

function confirmPassword() {
  if (!emailVerify()) return
  const codeRegex = /^\d{6}$/;
  if (!codeRegex.test(emailCode.value)) {
    notification.error({
      message: '错误',
      description: '请输入正确的验证码'
    })
    return
  }
  if (newPassword.value === null || newPassword.value === "") {
    notification.error({
      message: '错误',
      description: '请输入新的密码'
    })
    return
  }
  if (newPassword.value !== confirmNewPassword.value) {
    notification.error({
      message: '错误',
      description: '密码不一致，请检查密码'
    })
    return
  }
  apiInstance.post("/user/forgetPassword", {
    email: email.value,
    code: emailCode.value,
    newPassword: newPassword.value
  }).then(res => {
    if (res.data.code === code.CODE_VERIFY_SUCCESS) {
      notification.success({
        message: '成功',
        description: res.data.message
      })
      passwordForm.value = false
      passwordSuccess.value = true
    } else if (res.data.code === code.CODE_VERIFY_FAILED) {
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

function sendCode() {
  if (!emailVerify()) return
  sendLoading.value = true
  apiInstance.post("/user/emailSend", {
    email: email.value
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
</script>

<template>
  <a-layout class="forgetPasswordMain">
    <a-layout-header class="forgetPasswordHeader">
      学生选课管理系统
      <RollbackOutlined @click="backToLogin"/>
    </a-layout-header>
    <a-layout-content>
      <div class="forgetPasswordForm" v-if="passwordForm">
        <div>通过邮箱找回密码</div>
        <div style="margin-top: 15px">
          <a-input placeholder="请输入邮箱" v-model:value="email"/>
          <div style="display: flex;margin-top: 15px">
            <a-input placeholder="请输入验证码" v-model:value="emailCode"></a-input>
            <a-button type="primary" style="margin-left: 5px" :loading="sendLoading" @click="sendCode">发送验证码
            </a-button>
          </div>
          <a-input-password placeholder="新的密码" class="disableEye" style="margin-top: 15px"
                            v-model:value="newPassword"/>
          <a-input-password placeholder="确认密码" class="disableEye" style="margin-top: 15px"
                            v-model:value="confirmNewPassword"/>
        </div>
        <div>
          <a-button type="primary" style="margin-top: 15px" @click="confirmPassword">提交</a-button>
        </div>
      </div>

      <div v-if="passwordSuccess">
        <a-result
            status="success"
            title="密码修改成功"
            sub-title="现在可以进行登录了"
        >
          <template #extra>
            <a-button type="primary" @click="backToLogin">点击返回登录界面</a-button>
          </template>
        </a-result>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<style scoped>
.forgetPasswordMain {
  height: 100vh;
  width: 100vw;
}

.forgetPasswordHeader {
  color: lightsteelblue;
  font-size: 25px;
  font-weight: bold;
  padding-left: 15px;
  padding-right: 15px;
  display: flex;
  justify-content: space-between;
}

.forgetPasswordForm {
  font-size: 25px;
  font-weight: bold;
  padding-top: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.disableEye ::-ms-reveal {
  display: none;
}
</style>
