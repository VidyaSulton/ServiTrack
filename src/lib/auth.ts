import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not defined. Please add it to your .env.local file."
  );
}

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("vehicle_service_db");

/**
 * Better Auth configuration with MongoDB adapter.
 * Uses email/password authentication with cookie-based sessions.
 */
export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
    },
  },
});

/**
 * Export the auth type for use in API routes.
 */
export type Session = typeof auth.$Infer.Session;
