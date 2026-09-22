/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend origin without trailing slash, e.g. https://api.midominio.com */
  readonly VITE_BACKEND_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
