import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAuth } from "@/lib/session";
import { ensureIndexes } from "@/lib/db-indexes";
import { vehicleSchema } from "@/lib/validations/vehicle";
import { toVehicleClient, type Vehicle } from "@/models/vehicle";
import type { ApiResponse } from "@/types";

/**
 * GET /api/vehicles — List all vehicles for current user.
 */
export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const { userId } = await requireAuth();
    await ensureIndexes();

    const db = await getDb();
    const vehicles = await db
      .collection<Vehicle>("vehicles")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: vehicles.map(toVehicleClient),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar kendaraan." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vehicles — Create a new vehicle.
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const { userId } = await requireAuth();
    await ensureIndexes();

    const body = await request.json();
    const parsed = vehicleSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Data tidak valid.";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      );
    }

    const db = await getDb();
    const data = parsed.data;

    // Check for duplicate plate number per user
    const existing = await db
      .collection<Vehicle>("vehicles")
      .findOne({ userId, plateNumber: data.plateNumber });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `Kendaraan dengan plat ${data.plateNumber} sudah terdaftar.`,
        },
        { status: 409 }
      );
    }

    const now = new Date();
    const vehicle: Omit<Vehicle, "_id"> = {
      userId,
      plateNumber: data.plateNumber,
      brand: data.brand,
      model: data.model,
      year: data.year,
      color: data.color,
      type: data.type,
      fuelType: data.fuelType,
      engineCapacity: data.engineCapacity || undefined,
      transmission: data.transmission || undefined,
      notes: data.notes || undefined,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("vehicles").insertOne(vehicle);

    const inserted = {
      _id: result.insertedId,
      ...vehicle,
    } as Vehicle;

    return NextResponse.json(
      { success: true, data: toVehicleClient(inserted) },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    // Handle MongoDB duplicate key error
    if (
      error instanceof Error &&
      "code" in error &&
      (error as unknown as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { success: false, error: "Nomor plat sudah terdaftar." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Gagal menambahkan kendaraan." },
      { status: 500 }
    );
  }
}
