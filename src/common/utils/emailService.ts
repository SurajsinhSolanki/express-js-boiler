import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs'; // Import ejs directly
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

const transporter = nodemailer.createTransport({
  host: ENV.SMTP_HOST,
  port: ENV.SMTP_PORT,
  secure: ENV.SMTP_SECURE, // true for 465, false for other ports
  auth: {
    user: ENV.SMTP_USER,
    pass: ENV.SMTP_PASSWORD
  }
});

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
    throw new Error('Failed to send email');
  }
};
