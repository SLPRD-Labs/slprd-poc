interface ViteTypeOptions {
    strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
    readonly VITE_DEFAULT_HOMESERVER_BASE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
