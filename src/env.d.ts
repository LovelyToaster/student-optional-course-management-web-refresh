interface ImportMetaEnv {
    readonly VITE_DEEPSEEK_URL: string
    readonly VITE_DEEPSEEK_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
