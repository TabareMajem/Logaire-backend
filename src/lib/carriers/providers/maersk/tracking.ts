done done

import { TrackingRequest, TrackingUpdate } from '../../types/tracking';
import { mapFromMaerskTracking } from './mapper';

export async function trackMaerskShipment(
  this: MaerskCarrier,
  reference: string
): Promise<TrackingUpdate[]> {
  const response = await this.makeRequest<MaerskTrackingResponse>(
    `/tracking/${reference}`,
    { method: 'GET' }
  );

  return mapFromMaerskTracking(response);
}