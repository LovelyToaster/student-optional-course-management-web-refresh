import {defineStore} from "pinia";
import {reactive} from "vue";
import {LoginInter} from "@/types";


const useLoginStore = defineStore("login", () => {
    let userInfo = reactive<LoginInter>({
        userName: null,
        permissions: null,
        avatarPath: null
    })

    return {
        userInfo
    }
})

export default useLoginStore