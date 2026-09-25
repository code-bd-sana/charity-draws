import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-test-app';
import { MockPrismaService } from './helpers/prisma-mock.helper';
import { createHostSession, createAdminSession } from './helpers/e2e-auth.helper';

describe('Host Payout & Revenue Cycle (e2e)', () => {
  let app: INestApplication;
  let prismaMock: MockPrismaService;

  const hostSession = createHostSession('host-uuid-payout', 'host@payouts.co.uk');
  const adminSession = createAdminSession('admin-uuid-payout', 'admin@charitydraws.co.uk');

  const mockHostProfile = {
    id: 'host-profile-payout-1',
    userId: hostSession.id,
    businessName: 'Outdoor Adventure Draws',
    walletBalance: 1000.0,
    isVerified: true,
    user: { id: hostSession.id, firstName: 'Sam', lastName: 'Fisher', email: hostSession.email },
  };

  const mockWithdrawalId = 'withdrawal-e2e-uuid-1';
  const mockWithdrawalRecord = {
    id: mockWithdrawalId,
    hostId: mockHostProfile.id,
    amount: 500,
    feeAmount: 50,
    netAmount: 450,
    payoutMethod: 'BANK_TRANSFER',
    payoutDetails: JSON.stringify({ bankName: 'Barclays', accountNumber: '12345678' }),
    status: 'PENDING',
    createdAt: new Date(),
    host: mockHostProfile,
  };

  beforeAll(async () => {
    const context = await createTestApp();
    app = context.app;
    prismaMock = context.prismaMock;

    // Standard default $transaction mock implementation
    prismaMock.$transaction.mockImplementation(async (callback: any) => {
      return callback({
        hostProfile: {
          update: jest.fn().mockResolvedValue({
            ...mockHostProfile,
            walletBalance: 500.0,
          }),
        },
        withdrawal: {
          create: jest.fn().mockResolvedValue(mockWithdrawalRecord),
          update: jest.fn().mockResolvedValue({
            ...mockWithdrawalRecord,
            status: 'COMPLETED',
            adminNotes: 'Transferred via Faster Payments Ref #99281',
          }),
        },
        transaction: {
          create: jest.fn().mockResolvedValue({
            id: 'tx-with-1',
            type: 'HOST_WITHDRAWAL',
            amount: 500,
            status: 'COMPLETED',
          }),
        },
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Revenue Calculation → Withdrawal Request → Admin Moderation', () => {
    it('Step 1: GET /api/v1/hosts/wallet returns host balance & lifetime earnings with 10% fee rate', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue(mockHostProfile);
      prismaMock.withdrawal.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 200 } }) // pending
        .mockResolvedValueOnce({ _sum: { amount: 500 } }); // completed
      prismaMock.raffle.findMany.mockResolvedValue([
        { pricePerTicket: 10, ticketsSold: 120 },
      ]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/hosts/wallet')
        .set('Cookie', hostSession.cookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.availableBalance).toBe(1000);
      expect(res.body.data.commissionRate).toBe(10);
      expect(res.body.data.totalLifetimeEarnings).toBe(1200);
    });

    it('Step 2: Reject withdrawal request when amount exceeds available wallet balance', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue(mockHostProfile);

      const res = await request(app.getHttpServer())
        .post('/api/v1/hosts/withdraw')
        .set('Cookie', hostSession.cookie)
        .send({
          amount: 2500, // Exceeds 1000 balance
          payoutMethod: 'BANK_TRANSFER',
          payoutDetails: { bankName: 'Barclays', accountNumber: '12345678' },
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('Step 3: Host submits valid £500 withdrawal request (10% fee deducted & balance decremented)', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue(mockHostProfile);

      const res = await request(app.getHttpServer())
        .post('/api/v1/hosts/withdraw')
        .set('Cookie', hostSession.cookie)
        .send({
          amount: 500,
          payoutMethod: 'BANK_TRANSFER',
          payoutDetails: { bankName: 'Barclays', accountNumber: '12345678' },
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.withdrawal.grossAmount).toBe(500);
      expect(res.body.data.withdrawal.netAmount).toBe(450);
      expect(res.body.data.withdrawal.feeAmount).toBe(50);
    });

    it('Step 4: Admin lists all pending host withdrawal requests', async () => {
      prismaMock.withdrawal.findMany.mockResolvedValue([mockWithdrawalRecord]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/withdrawals')
        .set('Cookie', adminSession.cookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].id).toBe(mockWithdrawalId);
      expect(res.body.data[0].status).toBe('PENDING');
    });

    it('Step 5: Admin approves / completes the withdrawal request', async () => {
      prismaMock.withdrawal.findUnique.mockResolvedValue(mockWithdrawalRecord);

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/admin/withdrawals/${mockWithdrawalId}/status`)
        .set('Cookie', adminSession.cookie)
        .send({
          status: 'COMPLETED',
          adminNotes: 'Transferred via Faster Payments Ref #99281',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('COMPLETED');
    });
  });
});
