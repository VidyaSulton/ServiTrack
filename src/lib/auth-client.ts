import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client-side instance for React/Next.js.
 * Provides hooks (useSession) and methods (signIn, signUp, signOut).
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
