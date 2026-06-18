import { ObjectId } from "mongodb";

/**
 * Vehicle document interface for the `vehicles` MongoDB collection.
 * Matches PRD Section 4 schema exactly.
 */
export interface Vehicle {
  _id: ObjectId;
  userId: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  type: VehicleType;
  fuelType: FuelType;
  engineCapacity?: string;
  transmission?: TransmissionType;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Vehicle type options.
 */
export type VehicleType = "car" | "motorcycle" | "truck" | "van";

/**
 * Fuel type options.
 */
export type FuelType = "gasoline" | "diesel" | "electric" | "hybrid";

/**
 * Transmission type options.
 */
export type TransmissionType = "manual" | "automatic";

/**
 * Client-safe vehicle data with _id converted to string.
 */
export interface VehicleClient {
  id: string;
  userId: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  type: VehicleType;
  fuelType: FuelType;
  engineCapacity?: string;
  transmission?: TransmissionType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Converts a MongoDB Vehicle document to a client-safe object.
 * Converts ObjectId to string and Date to ISO string.
 */
export function toVehicleClient(vehicle: Vehicle): VehicleClient {
  return {
    id: vehicle._id.toHexString(),
    userId: vehicle.userId,
    plateNumber: vehicle.plateNumber,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    type: vehicle.type,
    fuelType: vehicle.fuelType,
    engineCapacity: vehicle.engineCapacity,
    transmission: vehicle.transmission,
    notes: vehicle.notes,
    createdAt: vehicle.createdAt.toISOString(),
    updatedAt: vehicle.updatedAt.toISOString(),
  };
}
