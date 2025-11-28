// Notification types

export interface Notification {
  id: string;
  type: 'job_offer' | 'job_rejection' | 'info' | 'promotion' | 'success';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  data?: any;
}
