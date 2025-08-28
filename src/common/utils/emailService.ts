import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import path from 'path';
import { ENV } from '@/common/utils/config';
import { createChildLogger } from './logger';

const logger = createChildLogger('email-service');

interface EmailOptions {
  to: string;
  subject: string;
  template: string; // Name of the EJS template file (e.g., 'welcome')
  context: object; // Data to pass to the template
}

// Existing transporter setup
const transporter = nodemailer.createTransport({
  host: ENV.SMTP_HOST,
  port: ENV.SMTP_PORT,
  secure: ENV.SMTP_SECURE, // true for 465, false for other ports
  auth: {
    user: ENV.SMTP_USER,
    pass: ENV.SMTP_PASSWORD
  }
});

// Existing sendEmail function
export const sendEmail = async (options: EmailOptions) => {
  try {
    const templatePath = path.resolve('./templates/emails', `${options.template}.ejs`);
    const html = await ejs.renderFile(templatePath, options.context);

    const mailOptions = {
      from: ENV.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: html // Use the rendered HTML
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.to} with subject: ${options.subject} using template: ${options.template}`);
  } catch (error) {
    logger.error({ error }, `Failed to send email to ${options.to} using template: ${options.template}`);
    // Rethrow to allow higher-level handlers to manage the error
    throw error;
  }
};

// New function to send error emails
export const sendErrorEmail = async (error: Error) => {
  if (!ENV.DEV_EMAIL) {
    logger.warn('DEV_EMAIL not configured, skipping error email notification.');
    return;
  }

  try {
    const context = {
      error: {
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString(),
      serviceName: ENV.SERVICE_NAME,
      serviceVersion: ENV.SERVICE_VERSION
    };

    await sendEmail({
      to: ENV.DEV_EMAIL,
      subject: `[${ENV.NODE_ENV}] Error in ${ENV.SERVICE_NAME}: ${error.message.substring(0, 50)}`,
      template: 'error', // Corresponds to templates/emails/error.ejs
      context: context
    });
    logger.info(`Error email sent to ${ENV.DEV_EMAIL} for error: ${error.message}`);
  } catch (emailError) {
    logger.error({ emailError }, 'Failed to send error notification email.');
    // Do not rethrow here, as the original error should still be handled
  }
};
