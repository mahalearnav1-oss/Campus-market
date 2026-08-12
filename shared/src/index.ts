// Shared Constants & Types for CampusMarket

export const APP_NAME = "CampusMarket";
export const API_VERSION = "v1";

export interface ApiResponseEnvelope<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Array<{ field?: string; issue: string }>;
  };
  meta?: {
    timestamp: string;
    page?: number;
    limit?: number;
    totalItems?: number;
    totalPages?: number;
  };
}

export interface HealthCheckStatus {
  status: "ok" | "error";
  service: string;
  environment: string;
  timestamp: string;
  version: string;
}
