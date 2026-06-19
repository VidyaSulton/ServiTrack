import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, getMongoClient } from "@/lib/mongodb";
import { requireAuth } from "@/lib/session";
import { ensureIndexes } from "@/lib/db-indexes";
import { vehicleSchema } from "@/lib/validations/vehicle";
import { toVehicleClient, type Vehicle } from "@/models/vehicle";
import type { ApiResponse } from "@/types";

/**
 * GET /api/vehicles/[id] — Get vehicle by ID.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID kendaraan tidak valid." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const vehicle = await db
      .collection<Vehicle>("vehicles")
      .findOne({ _id: new ObjectId(id), userId });

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: "Kendaraan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: toVehicleClient(vehicle),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Gagal memuat data kendaraan." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/vehicles/[id] — Update vehicle by ID.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID kendaraan tidak valid." },
        { status: 400 }
      );
    }

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
    const objectId = new ObjectId(id);

    // Check duplicate plate number (exclude current vehicle)
    const duplicate = await db
      .collection<Vehicle>("vehicles")
      .findOne({
        userId,
        plateNumber: data.plateNumber,
        _id: { $ne: objectId },
      });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: `Kendaraan lain dengan plat ${data.plateNumber} sudah terdaftar.`,
        },
        { status: 409 }
      );
    }

    const result = await db.collection<Vehicle>("vehicles").findOneAndUpdate(
      { _id: objectId, userId },
      {
        $set: {
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
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Kendaraan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: toVehicleClient(result),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Gagal mengupdate kendaraan." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vehicles/[id] — Delete vehicle + cascade delete service logs.
 * Uses MongoDB transaction for atomic multi-collection delete.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    await ensureIndexes();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID kendaraan tidak valid." },
        { status: 400 }
      );
    }

    const objectId = new ObjectId(id);
    const db = await getDb();

    // Verify vehicle exists and belongs to user
    const vehicle = await db
      .collection<Vehicle>("vehicles")
      .findOne({ _id: objectId, userId });

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: "Kendaraan tidak ditemukan." },
        { status: 404 }
      );
    }

    // Use transaction for atomic cascade delete
    const client = await getMongoClient();
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        // Delete all service logs for this vehicle
        await db
          .collection("service_logs")
          .deleteMany({ vehicleId: objectId, userId }, { session });

        // Delete the vehicle
        await db
          .collection("vehicles")
          .deleteOne({ _id: objectId, userId }, { session });
      });
    } finally {
      await session.endSession();
    }

    return NextResponse.json({
      success: true,
      data: { message: "Kendaraan dan semua log servis terkait berhasil dihapus." },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Gagal menghapus kendaraan." },
      { status: 500 }
    );
  }
}
