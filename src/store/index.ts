import {defineStore} from "pinia";
import {reactive} from "vue";
import {LoginInter, StudentInfoInter, TeacherInfoInter} from "@/types";


export const useLoginStore = defineStore("login", () => {
    let userInfo = reactive<LoginInter>({
        userName: null,
        permissions: null,
        avatarPath: null
    })

    const defaultUserInfo: LoginInter = {
        userName: null,
        permissions: null,
        avatarPath: null
    }

    function updateUserInfo(info: LoginInter) {
        Object.assign(userInfo, defaultUserInfo)
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
        teacherNo: null,
        teacherName: null,
        teacherSex: null,
        teacherAge: null,
        teacherDegree: null,
        teacherJob: null,
        teacherGraduateInstitutions: null,
        facultyName: null,
        email: null
    })

    const defaultTeacherInfo: TeacherInfoInter = {
        teacherNo: null,
        teacherName: null,
        teacherSex: null,
        teacherAge: null,
        teacherDegree: null,
        teacherJob: null,
        teacherGraduateInstitutions: null,
        facultyName: null,
        email: null
    }

    function updateTeacherInfo(info: TeacherInfoInter) {
        Object.assign(teacherInfo, defaultTeacherInfo)
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
        studentNo: null,
        studentName: null,
        studentSex: null,
        studentAge: null,
        facultyName: null,
        className: null,
        majorName: null,
        averageGPA: null,
        email: null
    })

    const defaultStudentInfo: StudentInfoInter = {
        studentNo: null,
        studentName: null,
        studentSex: null,
        studentAge: null,
        facultyName: null,
        className: null,
        majorName: null,
        averageGPA: null,
        email: null
    }


    let gpaList = reactive([])

    function updateStudentInfo(info: StudentInfoInter) {
        Object.assign(studentInfo, defaultStudentInfo)
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