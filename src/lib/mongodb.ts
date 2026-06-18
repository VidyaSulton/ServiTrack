import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not defined. Please add it to your .env.local file."
  );
}

const uri: string = process.env.MONGODB_URI;
const dbName = "vehicle_service_db";

const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so the client
  // is not recreated on every HMR (Hot Module Replacement) update.
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new client for each instance.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Returns the connected MongoDB client instance.
 * Uses a singleton pattern to avoid connection leaks in development.
 */
export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}

/**
 * Returns the default database instance.
 */
export async function getDb(): Promise<Db> {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

export default clientPromise;
