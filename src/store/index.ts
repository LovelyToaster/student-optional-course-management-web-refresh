import {defineStore} from "pinia";
import {reactive} from "vue";
import {LoginInter, StudentInfoInter, TeacherInfoInter} from "@/types";


export const useLoginStore = defineStore("login", () => {
    let userInfo = reactive<LoginInter>({
        userName: "加载中",
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
}, {
    persist: true
})
export const useTeacherStore = defineStore("teacher", () => {
    let teacherInfo = reactive<TeacherInfoInter>({
        teacherNo: "加载中",
        teacherName: "加载中",
        teacherSex: "加载中",
        teacherAge: "加载中",
        teacherDegree: "加载中",
        teacherJob: "加载中",
        teacherGraduateInstitutions: "加载中",
        facultyName: "加载中"
    })

    function updateTeacherInfo(info: TeacherInfoInter) {
        Object.assign(teacherInfo, info)
    }

    return {
        teacherInfo,
        updateTeacherInfo
    }
}, {
    persist: true
})

export const useStudentStore = defineStore("student", () => {
    let studentInfo = reactive<StudentInfoInter>({
        studentNo: "加载中",
        studentName: "加载中",
        studentSex: "加载中",
        studentAge: "加载中",
        facultyName: "加载中",
        className: "加载中",
        averageGPA: "加载中",
    })

    let gpaList = reactive([])

    function updateStudentInfo(info: StudentInfoInter) {
        Object.assign(studentInfo, info)
    }

    return {
        studentInfo,
        gpaList,
        updateStudentInfo
    }
}, {
    persist: true
})