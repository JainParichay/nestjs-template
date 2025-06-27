export const QUEUE_NAMES = {
  DEFAULT: 'default',
  EMAIL: 'email',
  NOTIFICATION: 'notification',
  SMS: 'sms',
} as const;

export const EMAIL_JOBS = {
  SEND_OTP: 'send-otp',
  SEND_WELCOME: 'send-welcome',
} as const;

export const SMS_JOBS = {
  SEND_OTP: 'send-otp',
  SEND_ALERT: 'send-alert',
} as const;

export const NOTIFICATION_JOBS = {
  SEND_PUSH: 'send-push',
  SEND_ALERT: 'send-alert',
} as const;

export const DEFAULT_JOBS = {
  PROCESS_DATA: 'process-data',
  GENERATE_REPORT: 'generate-report',
} as const;
