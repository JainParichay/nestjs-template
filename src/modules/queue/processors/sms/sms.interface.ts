export interface SendOtpSmsData {
  to: string;
  otp: string;
  template?: string;
  channel?: 'sms' | 'whatsapp';
}

export interface SendAlertSmsData {
  to: string;
  message: string;
  template?: string;
  channel?: 'sms' | 'whatsapp';
}

export interface SmsJobResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
