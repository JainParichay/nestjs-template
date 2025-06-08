export interface SendOtpEmailData {
  to: string;
  otp: string;
  template?: string;
}

export interface SendWelcomeEmailData {
  to: string;
  name: string;
  template?: string;
}

export interface EmailJobResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
