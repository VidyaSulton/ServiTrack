/**
 * Shared global TypeScript types for the Vehicle Service Monitoring System.
 */

/**
 * Standard API response shape.
 * All API routes must return this structure for consistency.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Pagination metadata for list endpoints.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated API response shape.
 */
export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data?: T[];
  pagination?: PaginationMeta;
  error?: string;
}

/**
 * Query parameters for filtering service logs.
 */
export interface ServiceLogFilters {
  vehicleId?: string;
  serviceType?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Report query parameters.
 */
export interface ReportQuery {
  year: number;
  month?: number;
}

/**
 * Report download request body.
 */
export interface ReportDownloadRequest {
  format: "xlsx" | "docx";
  year: number;
  month?: number;
}

/**
 * Navigation menu item type for sidebar.
 */
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
