import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

/**
 * GET /api/service-logs — List service logs with query filters.
 * Will be fully implemented in Phase 4.
 */
export async function GET(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json({
    success: false,
    error: "Not implemented yet. Coming in Phase 4.",
  }, { status: 501 });
}

/**
 * POST /api/service-logs — Create a new service log.
 * Will be fully implemented in Phase 4.
 */
export async function POST(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json({
    success: false,
    error: "Not implemented yet. Coming in Phase 4.",
  }, { status: 501 });
}
