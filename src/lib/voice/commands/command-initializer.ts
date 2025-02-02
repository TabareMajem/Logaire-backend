import { CommandRegistry } from './command-registry';
import { ShipmentCommandHandlers } from './handlers/shipment-commands';
import { BookingCommandHandlers } from './handlers/booking-commands';
import { DocumentCommandHandlers } from './handlers/document-commands';
import { AnalyticsCommandHandlers } from './handlers/analytics-commands';

export function initializeCommands(registry: CommandRegistry): void {
  const shipmentHandlers = new ShipmentCommandHandlers();
  const bookingHandlers = new BookingCommandHandlers();
  const documentHandlers = new DocumentCommandHandlers();
  const analyticsHandlers = new AnalyticsCommandHandlers();

  // Register shipment commands
  registry.register('track', shipmentHandlers.trackShipment.bind(shipmentHandlers));
  registry.register('shipments', shipmentHandlers.listActiveShipments.bind(shipmentHandlers));

  // Register booking commands
  registry.register('booking', bookingHandlers.checkBookingStatus.bind(bookingHandlers));
  registry.register('bookings', bookingHandlers.listUpcomingBookings.bind(bookingHandlers));

  // Register document commands
  registry.register('documents', documentHandlers.listRecentDocuments.bind(documentHandlers));
  registry.register('document', documentHandlers.checkDocumentStatus.bind(documentHandlers));

  // Register analytics commands
  registry.register('metrics', analyticsHandlers.getShipmentMetrics.bind(analyticsHandlers));
  registry.register('report', analyticsHandlers.getPerformanceReport.bind(analyticsHandlers));
}