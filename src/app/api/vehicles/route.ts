import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

/**
 * GET /api/vehicles — List all vehicles for current user.
 * Will be fully implemented in Phase 3.
 */
export async function GET(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json({
    success: false,
    error: "Not implemented yet. Coming in Phase 3.",
  }, { status: 501 });
}

/**
 * POST /api/vehicles — Create a new vehicle.
 * Will be fully implemented in Phase 3.
 */
export async function POST(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json({
    success: false,
    error: "Not implemented yet. Coming in Phase 3.",
  }, { status: 501 });
}
