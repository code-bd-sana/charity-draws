import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendContactFormEmail', () => {
    it('should attempt to send contact form email', async () => {
      const sendMailMock = jest.fn().mockResolvedValue({ messageId: '123' });
      (service as any).transporter = {
        sendMail: sendMailMock,
      };

      await service.sendContactFormEmail({
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello, testing inquiry.',
        subject: 'General Question',
      });

      // Verification that method runs without throwing
      expect(service).toBeDefined();
    });
  });
});
