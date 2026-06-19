import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Gets the current authenticated session from the request headers.
 * For use in API routes and Server Components.
 * Returns null if not authenticated.
 */
export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * Gets the current authenticated user ID.
 * Throws an error if not authenticated (for use in API routes that require auth).
 */
export async function requireAuth(): Promise<{ userId: string; session: NonNullable<Awaited<ReturnType<typeof getServerSession>>> }> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return { userId: session.user.id, session };
}
