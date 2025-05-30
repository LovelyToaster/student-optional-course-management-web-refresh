<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";
import {LoginInter} from "@/types";
import {UserOutlined, KeyOutlined} from "@ant-design/icons-vue"
import {apiInstance} from "@/hooks/api";
import code from "@/hooks/code";
import {notification} from "ant-design-vue";
import {useLoginStore} from "@/store";
import {useRouter} from "vue-router";

let userInfo = reactive<LoginInter>({
  userName: null,
  userPassword: null,
  avatarPath: null
})
const loginStore = useLoginStore()
const router = useRouter()

function forgetPasswordOn() {
  router.push("/forgetPassword")
}

function getAvatar() {
  if (userInfo.userName != null) {
    apiInstance.get("/user/getAvatar", {params: {userName: userInfo.userName}}).then(res => {
      if (res.data.code === code.SEARCH_SUCCESS) {
        userInfo.avatarPath = res.data.data
      }
      if (res.data.code === code.SEARCH_FAILED) {
        userInfo.avatarPath = null
      }
    })
  }
}

function loginCheck(userName: string, userPassword: string) {
  if (!userName || !userPassword) {
    notification.error({
      message: "错误",
      description: "用户名或密码不能为空"
    })
    return false
  }
  return true
}

function login() {
  if (loginCheck(userInfo.userName, userInfo.userPassword)) {
    loading.value = true
    let timeOut = setTimeout(() => {
      loading.value = false
      notification.error({
        message: "错误",
        description: "登录超时,请检查网络或联系管理员"
      })
    }, 5000)
    apiInstance.post("/user/login", {
      userName: userInfo.userName,
      userPassword: userInfo.userPassword,
    }).then(res => {
      if (res.data.code === code.LOGIN_SUCCESS) {
        notification.success({
          message: "成功",
          description: res.data.message
        })
        loginStore.updateUserInfo(res.data.data);
        router.push("/management")
      }
      if (res.data.code === code.LOGIN_FAILED)
        notification.error({
          message: "错误",
          description: res.data.message
        })
      loading.value = false
      clearTimeout(timeOut)
    })
  }
}

function loginStatus(){
  apiInstance.get("/user/status").then(res => {
    if (res.data.code === code.LOGIN_SUCCESS) {
      loginStore.updateUserInfo(res.data.data);
      notification.success({
        message: "成功",
        description: res.data.message
      })
      router.push("/management")
    }
  })
}

onMounted(() => {
  loading.value = false
})

const loading = ref(true)
loginStatus()

</script>

<template>
  <a-spin style="max-height: 100%;backdrop-filter: blur(10px)" :spinning="loading">
    <div class="main" v-cloak>
      <div class="border">
        <div class="avatar">
          <a-avatar :size="88" :src="userInfo.avatarPath">
            <template #icon>
              <UserOutlined/>
            </template>
          </a-avatar>
        </div>
        <div>
          <a-form :model="userInfo">
            <div>
              <a-form-item name="userName"
                           :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]">
                <a-input v-model:value="userInfo.userName" placeholder="请输入用户名" @blur="getAvatar">
                  <template #prefix>
                    <UserOutlined/>
                  </template>
                </a-input>
              </a-form-item>
              <a-form-item name="userPassword"
                           :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]">
                <a-input-password v-model:value="userInfo.userPassword" placeholder="请输入密码" class="disableEye">
                  <template #prefix>
                    <KeyOutlined/>
                  </template>
                </a-input-password>
              </a-form-item>
            </div>
            <div class="button">
              <a-button type="primary" html-type="submit" @click="login">登录</a-button>
              <a-button type="primary" @click="forgetPasswordOn">忘记密码?</a-button>
            </div>
          </a-form>
        </div>
      </div>
    </div>
  </a-spin>
</template>

<style scoped>
.main {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-image: url("../assets/login/background.webp");
}

.border {
  width: 15vw;
  height: 35vh;
  border: 1px solid rgb(177, 246, 203);
  padding: 30px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.5);
}

.avatar {
  display: flex;
  justify-content: center;
}

.button {
  display: flex;
  justify-content: space-around;
}

/* 关闭edge的密码框眼睛 */
.disableEye ::-ms-reveal {
  display: none;
}
</style>