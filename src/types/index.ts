export * from "./nav";

export type ShipmentStatus = typeof import("@/config/constants").SHIPMENT_STATUS[keyof typeof import("@/config/constants").SHIPMENT_STATUS];
export type BookingStatus = typeof import("@/config/constants").BOOKING_STATUS[keyof typeof import("@/config/constants").BOOKING_STATUS];
export type DocumentType = typeof import("@/config/constants").DOCUMENT_TYPE[keyof typeof import("@/config/constants").DOCUMENT_TYPE];

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}