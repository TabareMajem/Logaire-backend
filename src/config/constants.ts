export const SHIPMENT_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export const BOOKING_STATUS = {
  REQUESTED: "requested",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const DOCUMENT_TYPE = {
  BILL_OF_LADING: "bill_of_lading",
  COMMERCIAL_INVOICE: "commercial_invoice",
  PACKING_LIST: "packing_list",
  CUSTOMS_DECLARATION: "customs_declaration",
} as const;

export const DATE_FORMATS = {
  DISPLAY: "MMM DD, YYYY",
  API: "YYYY-MM-DD",
  TIMESTAMP: "YYYY-MM-DD HH:mm:ss",
} as const;

export const LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_DOCUMENTS: 50,
  MAX_BOOKINGS_PER_PAGE: 20,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;