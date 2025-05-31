declare module '~/env' {
  export const env: {
    NEXTAUTH_SECRET: string;
    AUTH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    DATABASE_URL: string;
    NODE_ENV: 'development' | 'test' | 'production';
  };
}

declare namespace NodeJS {
  
  interface ProcessEnv {
    NEXTAUTH_SECRET: string;
    AUTH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
  }
}