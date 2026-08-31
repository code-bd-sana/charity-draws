const sendMail = jest.fn();

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({ sendMail })),
}));

import { MailService } from './mail.service';
import { config } from '../config';

describe('MailService', () => {
  beforeEach(() => {
    sendMail.mockReset();
  });

  it('dispatches contact form emails when SMTP credentials are configured', async () => {
    const originalUser = config.mail.user;
    const originalPass = config.mail.pass;
    config.mail.user = 'smtp-user';
    config.mail.pass = 'smtp-pass';
    const service = new MailService();
    sendMail.mockResolvedValue(undefined);

    await expect(
      service.sendContactFormEmail({
        name: 'Client',
        email: 'client@example.com',
        subject: 'Question',
        message: 'Hello',
      } as any),
    ).resolves.toMatchObject({ success: true });
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: 'client@example.com',
        subject: '[Contact Form] Question',
      }),
    );

    config.mail.user = originalUser;
    config.mail.pass = originalPass;
  });

  it('sends verification and password reset emails', async () => {
    const service = new MailService();
    sendMail.mockResolvedValue(undefined);

    await service.sendVerificationEmail('user@example.com', 'verify-token');
    await service.sendPasswordResetEmail('user@example.com', 'reset-token');

    expect(sendMail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Verify your email - Charity Draws',
        html: expect.stringContaining('verify-token'),
      }),
    );
    expect(sendMail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Reset your password - Charity Draws',
        html: expect.stringContaining('reset-token'),
      }),
    );
  });
});
