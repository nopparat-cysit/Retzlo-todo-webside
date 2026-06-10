import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      globalRole?: string | null;
    };
  }

  interface User {
    id: string;
    globalRole?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    globalRole?: string | null;
  }
}
