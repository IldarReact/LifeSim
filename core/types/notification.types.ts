// Notification types

export interface Notification<TData = unknown> {
  id: string;
  type: 'job_offer' | 'job_rejection' | 'info' | 'promotion' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  date?: string;
  data?: TData;
}
