done done

import { ScheduleRequest, Schedule } from '../../types/schedule';
import { mapToMaerskScheduleRequest, mapFromMaerskSchedule } from './mapper';

export async function getMaerskSchedules(
  this: MaerskCarrier,
  request: ScheduleRequest
): Promise<Schedule[]> {
  const maerskRequest = mapToMaerskScheduleRequest(request);
  
  const response = await this.makeRequest<MaerskScheduleResponse>(
    '/schedules/search',
    {
      method: 'POST',
      body: JSON.stringify(maerskRequest)
    }
  );

  return mapFromMaerskSchedule(response);
}