
declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string | undefined;
    MONGODB_URI: string | undefined;
    DB_NAME: string | undefined;
    CORS_ORIGIN: string | undefined;
  }
}
