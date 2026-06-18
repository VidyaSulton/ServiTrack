import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Better Auth catch-all API route handler.
 * Handles all /api/auth/* requests (login, register, session, etc.)
 */
export const { GET, POST } = toNextJsHandler(auth);
