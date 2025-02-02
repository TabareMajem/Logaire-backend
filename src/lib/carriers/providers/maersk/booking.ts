done done

import { BookingRequest, BookingConfirmation } from '../../types/booking';
import { mapToMaerskBooking, mapFromMaerskBooking } from './mapper';

export async function createMaerskBooking(
  this: MaerskCarrier,
  request: BookingRequest
): Promise<BookingConfirmation> {
  const maerskRequest = mapToMaerskBooking(request);
  
  const response = await this.makeRequest<MaerskBookingResponse>(
    '/bookings',
    {
      method: 'POST',
      body: JSON.stringify(maerskRequest)
    }
  );

  return mapFromMaerskBooking(response, this.config.code);
}