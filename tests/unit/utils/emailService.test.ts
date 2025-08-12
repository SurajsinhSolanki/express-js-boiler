import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import { sendEmail } from '@/common/utils/emailService'; // Use relative path
import { ENV } from '@/common/utils/config'; // Use relative path

// Mock nodemailer and ejs
vi.mock('nodemailer', () => ({
  createTransport: vi.fn().mockReturnValue({
    sendMail: vi.fn(),
    use: vi.fn() // Mock the 'use' method for EJS integration
  })
}));

vi.mock('ejs', () => ({
  renderFile: vi.fn()
}));

// Mock ENV variables
vi.mock('../../common/utils/config', () => ({
  // Use relative path for mock
  ENV: {
    SMTP_HOST: 'test.smtp.host',
    SMTP_PORT: 587,
    SMTP_SECURE: false,
    SMTP_USER: 'testuser',
    SMTP_PASSWORD: 'testpassword',
    SMTP_FROM: 'test@example.com'
  }
}));

describe('emailService', () => {
  const mockSendMail = nodemailer.createTransport().sendMail as vi.Mock;
  const mockRenderFile = ejs.renderFile as vi.Mock;

  beforeEach(() => {
    mockSendMail.mockClear();
    mockRenderFile.mockClear();
  });

  it('should send an email with rendered EJS template', async () => {
    const emailOptions = {
      to: 'recipient@example.com',
      subject: 'Test Subject',
      template: 'test-template',
      context: { name: 'Test User', value: '123' }
    };
    const renderedHtml = '<p>Hello Test User, value is 123</p>';

    mockRenderFile.mockResolvedValue(renderedHtml);

    await sendEmail(emailOptions);

    expect(mockRenderFile).toHaveBeenCalledWith(expect.any(String), emailOptions.context);
    expect(mockSendMail).toHaveBeenCalledTimes(1);
    expect(mockSendMail).toHaveBeenCalledWith({
      from: ENV.SMTP_FROM,
      to: emailOptions.to,
      subject: emailOptions.subject,
      html: renderedHtml
    });
  });

  it('should throw an error if email sending fails', async () => {
    const emailOptions = {
      to: 'fail@example.com',
      subject: 'Failed Email',
      template: 'fail-template',
      context: {}
    };
    const errorMessage = 'Network error';

    mockRenderFile.mockResolvedValue('<html></html>');
    mockSendMail.mockRejectedValue(new Error(errorMessage));

    await expect(sendEmail(emailOptions)).rejects.toThrow('Failed to send email');
    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if template rendering fails', async () => {
    const emailOptions = {
      to: 'renderfail@example.com',
      subject: 'Render Fail',
      template: 'invalid-template',
      context: {}
    };
    const errorMessage = 'Template not found';

    mockRenderFile.mockRejectedValue(new Error(errorMessage));

    await expect(sendEmail(emailOptions)).rejects.toThrow('Failed to send email');
    expect(mockRenderFile).toHaveBeenCalledTimes(1);
    expect(mockSendMail).not.toHaveBeenCalled();
  });
});
