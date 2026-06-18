import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

/**
 * GET /api/vehicles/[id] — Get vehicle by ID.
 * Will be fully implemented in Phase 3.
 */
export async function GET(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json({
    success: false,
    error: "Not implemented yet. Coming in Phase 3.",
  }, { status: 501 });
}

/**
 * PUT /api/vehicles/[id] — Update vehicle by ID.
 * Will be fully implemented in Phase 3.
 */
export async function PUT(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json({
    success: false,
    error: "Not implemented yet. Coming in Phase 3.",
  }, { status: 501 });
}

/**
 * DELETE /api/vehicles/[id] — Delete vehicle + its service logs.
 * Will be fully implemented in Phase 3.
 */
export async function DELETE(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json({
    success: false,
    error: "Not implemented yet. Coming in Phase 3.",
  }, { status: 501 });
}
