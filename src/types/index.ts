export interface LoginInter {
    userName: string,
    userPassword?: string,
    permissions?: number,
    avatarPath?: string
}

export interface TeacherInfoInter {
    teacherNo: string,
    teacherName: string,
    teacherSex: string,
    teacherAge: string,
    teacherDegree: string,
    teacherJob: string,
    teacherGraduateInstitutions: string,
    teacherStatus: string
}

export interface StudentInfoInter {
    studentNo: string,
    studentName: string,
    studentSex: string,
    studentAge: string,
    studentFaculties: string,
    studentClass: string,
    averageGPA: string
}