import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

/**
 * GET /api/service-logs/[id] — Get service log by ID.
 * Will be fully implemented in Phase 4.
 */
export async function GET(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json({
    success: false,
    error: "Not implemented yet. Coming in Phase 4.",
  }, { status: 501 });
}

/**
 * PUT /api/service-logs/[id] — Update service log by ID.
 * Will be fully implemented in Phase 4.
 */
export async function PUT(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json({
    success: false,
    error: "Not implemented yet. Coming in Phase 4.",
  }, { status: 501 });
}

/**
 * DELETE /api/service-logs/[id] — Delete service log by ID.
 * Will be fully implemented in Phase 4.
 */
export async function DELETE(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json({
    success: false,
    error: "Not implemented yet. Coming in Phase 4.",
  }, { status: 501 });
}
