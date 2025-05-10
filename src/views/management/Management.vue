<script setup lang="ts">
import {
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  BookOutlined,
  UnorderedListOutlined,
  BankOutlined,
  BarsOutlined,
  InsertRowBelowOutlined
} from "@ant-design/icons-vue";
import {useLoginStore, useStudentStore, useTeacherStore} from "@/store";
import apiInstance from "@/hooks/api";
import {ItemType, MenuProps, notification} from "ant-design-vue";
import code from "@/hooks/code";
import {useRouter} from "vue-router";
import {h, reactive, ref, VueElement} from "vue";

const loginStore = useLoginStore()
const router = useRouter()
router.push({path: "/management/home"})

function loginOut() {
  apiInstance.get("/user/loginOut")
      .then(res => {
        if (res.data.code === code.LOGIN_OUT_SUCCESS) {
          notification.success({
            message: "成功",
            description: res.data.message
          })
          router.push({path: "/login"})
        }
      })
}

const selectedKeys = ref<string[]>(['Home']);
const openKeys = ref<string[]>([]);

function getItem(
    label: VueElement | string,
    key: string,
    icon?: any,
    children?: ItemType[],
    type?: 'group',
): ItemType {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as ItemType;
}

const rootItems: ItemType[] = reactive([
  getItem('主页', 'Home', () => h(HomeOutlined)),
  getItem('人员管理', 'UserManagement', () => h(UserOutlined), [
    getItem('学生管理', 'StudentManagement'),
    getItem('教师信息', 'TeacherManagement'),
  ]),
  getItem('院系管理', 'FacultyManagement', () => h(BankOutlined)),
  getItem('专业管理', 'MajorManagement', () => h(BarsOutlined),),
  getItem('班级管理', 'ClassManagement', () => h(InsertRowBelowOutlined),),
])

const teacherItems: ItemType[] = reactive([
  getItem('主页', 'Home', () => h(HomeOutlined)),

]);

const studentItems: ItemType[] = reactive([
  getItem('主页', 'Home', () => h(HomeOutlined)),

  getItem('成绩管理', 'GradeManagement', () => h(UnorderedListOutlined), [
    getItem('我的成绩', 'GradeSearch'),
    getItem('成绩统计', 'GradeStatistics')
  ]),
  getItem("课程管理", 'CourseManagement', () => h(BookOutlined), [
    getItem('课程选择', 'CourseSearch'),
  ]),
  getItem('个人信息', 'PersonalInformation', () => h(UserOutlined))

]);

const handleClick: MenuProps['onClick'] = e => {
  router.push({name: e.key as string});
};

function getUserInfo() {
  if (loginStore.userInfo.permissions === 0 || loginStore.userInfo.permissions === 1) {
    apiInstance.post("/teacher/search", {
      teacherNo: loginStore.userInfo.userName
    }).then((res) => {
      const teacherStore = useTeacherStore();
      teacherStore.updateTeacherInfo(res.data.data[0])
    });
  }
  if (loginStore.userInfo.permissions === 2) {
    apiInstance.post("/student/search", {
      studentNo: loginStore.userInfo.userName
    }).then((res) => {
      const studentStore = useStudentStore();
      studentStore.updateStudentInfo(res.data.data[0])
    });
  }
}

getUserInfo()
</script>

<template>
  <a-layout class="main">
    <a-layout-sider style="overflow-y: auto;overflow-x:hidden;scrollbar-gutter: auto;">
      <div class="sideText">
        <h1>学生选课管理系统</h1>
      </div>
      <a-menu
          v-model:openKeys="openKeys"
          v-model:selectedKeys="selectedKeys"
          style="width: 100%"
          mode="inline"
          theme="dark"
          :items="loginStore.userInfo.permissions===0?rootItems:loginStore.userInfo.permissions===1?teacherItems:studentItems"
          @click="handleClick"
      ></a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header>
        <div class="header">
          <div class="headerIcon">
            <LogoutOutlined @click="loginOut"/>
          </div>
          <a-avatar :size="50" :src="loginStore.userInfo.avatarPath">
            <template #icon>
              <UserOutlined/>
            </template>
          </a-avatar>
        </div>
      </a-layout-header>
      <a-layout-content>
        <RouterView></RouterView>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.main {
  height: 100vh;
  width: 100vw;
}

.header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
}

.headerIcon {
  font-size: 25px;
  color: lightsteelblue;
  margin-right: 10px;
}

.sideText {
  color: lightsteelblue;
  font-size: 20px;
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ant-layout-sider {
  flex: 0 0 250px !important;
  width: 250px !important;
  max-width: 250px !important;
  min-width: 250px !important;
}
</style>