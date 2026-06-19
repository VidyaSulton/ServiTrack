import { getDb } from "./mongodb";

/**
 * Ensures all required MongoDB indexes are created.
 * Called lazily on first API request.
 * Follows PRD Section 4 indexing strategy.
 */
let indexesCreated = false;

export async function ensureIndexes(): Promise<void> {
  if (indexesCreated) return;

  const db = await getDb();

  // Vehicles indexes
  const vehicles = db.collection("vehicles");
  await vehicles.createIndex({ userId: 1 });
  await vehicles.createIndex({ userId: 1, plateNumber: 1 }, { unique: true });

  // Service logs indexes
  const serviceLogs = db.collection("service_logs");
  await serviceLogs.createIndex({ userId: 1 });
  await serviceLogs.createIndex({ vehicleId: 1 });
  await serviceLogs.createIndex({ userId: 1, serviceDate: -1 });
  await serviceLogs.createIndex({ userId: 1, nextServiceDate: 1 });

  indexesCreated = true;
}
