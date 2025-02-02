import { Alert } from '@/lib/api/alerts';
import { Document } from '@/lib/api/documents';
import { Activity } from '@/lib/api/activity';

export type UpdateType = 'alert' | 'document' | 'activity';

export interface RealtimeUpdate<T = unknown> {
  type: UpdateType;
  data: T;
}

export type AlertUpdate = RealtimeUpdate<Alert>;
export type DocumentUpdate = RealtimeUpdate<Document>;
export type ActivityUpdate = RealtimeUpdate<Activity>;