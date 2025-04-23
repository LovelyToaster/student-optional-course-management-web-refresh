import {defineStore} from "pinia";
import {reactive} from "vue";
import {LoginInter, StudentInfoInter, TeacherInfoInter} from "@/types";


export const useLoginStore = defineStore("login", () => {
    let userInfo = reactive<LoginInter>({
        userName: null,
        permissions: null,
        avatarPath: null
    })

    function updateUserInfo(info: LoginInter) {
        Object.assign(userInfo, info)
    }

    return {
        userInfo,
        updateUserInfo
    }
})
export const useTeacherStore = defineStore("teacher", () => {
    let teacherInfo = reactive<TeacherInfoInter>({
        teacherNo: null,
        teacherName: null,
        teacherSex: null,
        teacherAge: null,
        teacherDegree: null,
        teacherJob: null,
        teacherGraduateInstitutions: null,
        teacherStatus: null
    })

    function updateTeacherInfo(info: TeacherInfoInter) {
        Object.assign(teacherInfo, info)
    }

    return {
        teacherInfo,
        updateTeacherInfo
    }
})

export const useStudentStore = defineStore("student", () => {
    let studentInfo = reactive<StudentInfoInter>({
        studentNo: "加载中",
        studentName: "加载中",
        studentSex: "加载中",
        studentAge: "加载中",
        studentFaculties: "加载中",
        studentClass: "加载中",
        averageGPA: "加载中",
    })

    function updateStudentInfo(info: StudentInfoInter) {
        Object.assign(studentInfo, info)
    }

    return {
        studentInfo,
        updateStudentInfo
    }
})