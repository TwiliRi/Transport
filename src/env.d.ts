declare namespace NodeJS {
  interface ProcessEnv {
    NEXTAUTH_SECRET: string;
    AUTH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
  }
}