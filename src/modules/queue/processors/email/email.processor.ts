import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_NAMES, EMAIL_JOBS } from '../../queue.constants';
import {
  SendOtpEmailData,
  SendWelcomeEmailData,
  EmailJobResult,
} from './email.interface';

@Processor(QUEUE_NAMES.EMAIL)
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  @Process(EMAIL_JOBS.SEND_OTP)
  async handleSendOtp(job: Job<SendOtpEmailData>): Promise<EmailJobResult> {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
    this.logger.debug('Data:', job.data);

    try {
      // TODO: Implement your email sending logic here
      // For example, using nodemailer or any other email service
      const { to, otp, template } = job.data;

      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.logger.debug(`OTP email sent to ${to}`);
      return { success: true, messageId: `otp-${Date.now()}` };
    } catch (error) {
      this.logger.error(`Failed to send OTP email: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @Process(EMAIL_JOBS.SEND_WELCOME)
  async handleSendWelcome(
    job: Job<SendWelcomeEmailData>,
  ): Promise<EmailJobResult> {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
    this.logger.debug('Data:', job.data);

    try {
      // TODO: Implement your welcome email logic here
      const { to, name, template } = job.data;

      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.logger.debug(`Welcome email sent to ${to}`);
      return { success: true, messageId: `welcome-${Date.now()}` };
    } catch (error) {
      this.logger.error(`Failed to send welcome email: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
