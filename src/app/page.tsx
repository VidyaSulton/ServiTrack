import { redirect } from "next/navigation";

export default function Home() {
  // Will be updated in Phase 2 to check auth session
  // and redirect to /dashboard or /login accordingly
  redirect("/login");
}
