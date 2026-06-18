import { ObjectId } from "mongodb";

/**
 * Service item sub-document — embedded inside ServiceLog.
 * Uses MongoDB's embedded data model pattern (array of sub-documents).
 */
export interface ServiceItem {
  name: string;
  category: ServiceItemCategory;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

/**
 * Service item category options.
 */
export type ServiceItemCategory = "part" | "labor" | "fluid" | "other";

/**
 * Service type options.
 */
export type ServiceType =
  | "oil_change"
  | "tire_rotation"
  | "brake_service"
  | "engine_tune"
  | "transmission"
  | "cooling_system"
  | "electrical"
  | "body_repair"
  | "general_checkup"
  | "other";

/**
 * Service log status options.
 */
export type ServiceLogStatus = "completed" | "scheduled" | "in_progress";

/**
 * ServiceLog document interface for the `service_logs` MongoDB collection.
 * Matches PRD Section 4 schema exactly.
 */
export interface ServiceLog {
  _id: ObjectId;
  vehicleId: ObjectId;
  userId: string;
  serviceDate: Date;
  serviceType: ServiceType;
  odometer: number;
  workshopName?: string;
  mechanicNotes?: string;
  serviceItems: ServiceItem[];
  totalCost: number;
  nextServiceDate?: Date;
  nextServiceOdometer?: number;
  status: ServiceLogStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Client-safe service item data.
 */
export interface ServiceItemClient {
  name: string;
  category: ServiceItemCategory;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

/**
 * Client-safe service log data with _id and vehicleId converted to string.
 */
export interface ServiceLogClient {
  id: string;
  vehicleId: string;
  userId: string;
  serviceDate: string;
  serviceType: ServiceType;
  odometer: number;
  workshopName?: string;
  mechanicNotes?: string;
  serviceItems: ServiceItemClient[];
  totalCost: number;
  nextServiceDate?: string;
  nextServiceOdometer?: number;
  status: ServiceLogStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Converts a MongoDB ServiceLog document to a client-safe object.
 * Converts ObjectId to string and Date to ISO string.
 */
export function toServiceLogClient(log: ServiceLog): ServiceLogClient {
  return {
    id: log._id.toHexString(),
    vehicleId: log.vehicleId.toHexString(),
    userId: log.userId,
    serviceDate: log.serviceDate.toISOString(),
    serviceType: log.serviceType,
    odometer: log.odometer,
    workshopName: log.workshopName,
    mechanicNotes: log.mechanicNotes,
    serviceItems: log.serviceItems,
    totalCost: log.totalCost,
    nextServiceDate: log.nextServiceDate?.toISOString(),
    nextServiceOdometer: log.nextServiceOdometer,
    status: log.status,
    createdAt: log.createdAt.toISOString(),
    updatedAt: log.updatedAt.toISOString(),
  };
}
