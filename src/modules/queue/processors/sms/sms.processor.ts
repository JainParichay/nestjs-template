import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { SMS_JOBS } from '../../queue.constants';
import {
  SendOtpSmsData,
  SendAlertSmsData,
  SmsJobResult,
} from './sms.interface';

@Processor('sms')
export class SmsProcessor {
  private readonly logger = new Logger(SmsProcessor.name);

  @Process(SMS_JOBS.SEND_OTP)
  async handleSendOtp(job: Job<SendOtpSmsData>): Promise<SmsJobResult> {
    try {
      this.logger.debug(
        `Processing OTP SMS job ${job.id} of type ${job.name}`,
        job.data,
      );

      // TODO: Implement actual SMS/WhatsApp sending logic
      // This is a placeholder that simulates sending an SMS
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.logger.debug(
        `Successfully sent OTP SMS to ${job.data.to}`,
        job.data,
      );

      return {
        success: true,
        messageId: `msg_${Date.now()}`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send OTP SMS to ${job.data.to}`,
        error.stack,
      );
      throw error;
    }
  }

  @Process(SMS_JOBS.SEND_ALERT)
  async handleSendAlert(job: Job<SendAlertSmsData>): Promise<SmsJobResult> {
    try {
      this.logger.debug(
        `Processing alert SMS job ${job.id} of type ${job.name}`,
        job.data,
      );

      // TODO: Implement actual SMS/WhatsApp sending logic
      // This is a placeholder that simulates sending an SMS
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.logger.debug(
        `Successfully sent alert SMS to ${job.data.to}`,
        job.data,
      );

      return {
        success: true,
        messageId: `msg_${Date.now()}`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send alert SMS to ${job.data.to}`,
        error.stack,
      );
      throw error;
    }
  }
}
