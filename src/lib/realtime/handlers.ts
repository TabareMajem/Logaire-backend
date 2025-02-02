import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Alert } from '@/lib/api/alerts';
import { Document } from '@/lib/api/documents';
import { Activity } from '@/lib/api/activity';

export function handleAlertUpdate(
  queryClient: QueryClient,
  alert: Alert
) {
  // Update alerts cache
  queryClient.setQueryData(['alerts'], (old: Alert[] = []) => {
    return [alert, ...old];
  });
  toast[alert.type](`${alert.title}: ${alert.message}`);
  // Show toast notification
  // toast[alert.type]({
  //   title: alert.title,
  //   description: alert.message,
  // });
}

export function handleDocumentUpdate(
  queryClient: QueryClient,
  document: Document
) {
  queryClient.setQueryData(['recent-documents'], (old: Document[] = []) => {
    return [document, ...old];
  });

  toast.info('New document available', {
    description: document.title,
  });
}

export function handleActivityUpdate(
  queryClient: QueryClient,
  activity: Activity
) {
  queryClient.setQueryData(['activity-feed'], (old: Activity[] = []) => {
    return [activity, ...old];
  });
}