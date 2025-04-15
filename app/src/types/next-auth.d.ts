// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isEmailVerified: boolean;
      subscription?: {
        tier: string;
      };
    } & DefaultSession["user"];
  }

  interface User {
    isEmailVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isEmailVerified: boolean;
  }
}