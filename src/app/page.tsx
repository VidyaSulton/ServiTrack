import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Root page — session-aware redirect.
 * Authenticated users → /dashboard
 * Unauthenticated users → /login
 */
export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
