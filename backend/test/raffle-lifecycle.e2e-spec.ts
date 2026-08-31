import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-test-app';
import { MockPrismaService } from './helpers/prisma-mock.helper';
import { createHostSession, createAdminSession } from './helpers/e2e-auth.helper';

describe('Raffle Lifecycle & Governance Journey (e2e)', () => {
  let app: INestApplication;
  let prismaMock: MockPrismaService;

  const hostSession = createHostSession('host-user-uuid-1', 'host@charitydraws.co.uk');
  const adminSession = createAdminSession('admin-user-uuid-1', 'admin@charitydraws.co.uk');

  const mockHostProfile = {
    id: 'host-profile-uuid-1',
    userId: hostSession.id,
    businessName: 'Tactical Gear Ltd',
    isVerified: true,
    subscriptions: [
      {
        id: 'sub-1',
        status: 'ACTIVE',
        plan: {
          id: 'plan-1',
          name: 'Pro',
          maxActiveRaffles: 10,
        },
      },
    ],
    raffles: [],
  };

  const mockRaffleId = 'raffle-uuid-e2e-1';
  const mockRaffle = {
    id: mockRaffleId,
    hostId: mockHostProfile.id,
    title: 'Precision Rifle Sweepstakes',
    slug: 'precision-rifle-sweepstakes-xyz123',
    description: 'Win a top-tier precision rifle.',
    pricePerTicket: 10,
    totalTickets: 100,
    ticketsSold: 50,
    mainPrizeValue: 2500,
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000 * 7),
    status: 'PENDING_APPROVAL',
    isAutoDraw: true,
    autoDrawDate: true,
    autoDrawSoldOut: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    const context = await createTestApp();
    app = context.app;
    prismaMock = context.prismaMock;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Host Creation → Admin Approval → Marketplace Indexing → Winner Draw', () => {
    it('Step 1: Host creates a new raffle with Instant Wins (status = PENDING_APPROVAL)', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue(mockHostProfile);
      prismaMock.raffle.create.mockResolvedValue(mockRaffle);
      prismaMock.instantWin.createMany.mockResolvedValue({ count: 2 });

      const res = await request(app.getHttpServer())
        .post('/api/v1/raffles')
        .set('Cookie', hostSession.cookie)
        .send({
          title: 'Precision Rifle Sweepstakes',
          description: 'Win a top-tier precision rifle.',
          ticketPrice: 10,
          totalTickets: 100,
          mainPrizeValue: 2500,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
          instantWins: [
            { prizeName: '£50 Tactical Voucher', rrpValue: 50 },
            { prizeName: 'Tactical Backpack', rrpValue: 120 },
          ],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING_APPROVAL');
      expect(res.body.data.id).toBe(mockRaffleId);
    });

    it('Step 2: Admin views pending competitions in the moderation queue', async () => {
      prismaMock.raffle.findMany.mockResolvedValue([mockRaffle]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/raffles/admin/pending')
        .set('Cookie', adminSession.cookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].id).toBe(mockRaffleId);
    });

    it('Step 3: Admin approves the raffle (status transitions to ACTIVE)', async () => {
      const activeRaffle = { ...mockRaffle, status: 'ACTIVE' };
      prismaMock.raffle.findUnique.mockResolvedValue(mockRaffle);
      prismaMock.raffle.update.mockResolvedValue(activeRaffle);

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/raffles/admin/${mockRaffleId}/approve`)
        .set('Cookie', adminSession.cookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACTIVE');
    });

    it('Step 4: Public marketplace lists the approved active competition', async () => {
      const activeRaffleWithHost = {
        ...mockRaffle,
        status: 'ACTIVE',
        host: {
          id: mockHostProfile.id,
          businessName: mockHostProfile.businessName,
          user: { firstName: 'Host', lastName: 'Owner', avatarUrl: null },
        },
        category: { id: 'cat-1', name: 'Tactical' },
      };

      prismaMock.raffle.findMany.mockResolvedValue([activeRaffleWithHost]);
      prismaMock.raffle.count.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .get('/api/v1/raffles')
        .expect(200);

      expect(res.body.success).toBe(true);
      const list = Array.isArray(res.body.data) ? res.body.data : res.body.data.data;
      expect(list).toBeDefined();
      expect(list.length).toBe(1);
      expect(list[0].id).toBe(mockRaffleId);
    });

    it('Step 5: Admin triggers winner draw (creates Winner record & status transitions to ENDED)', async () => {
      const activeRaffleWithTickets = {
        ...mockRaffle,
        status: 'ACTIVE',
        winners: [],
        tickets: [
          { id: 'ticket-1', userId: 'client-user-1', ticketNumber: 42 },
          { id: 'ticket-2', userId: 'client-user-2', ticketNumber: 88 },
        ],
      };

      const mockWinner = {
        id: 'winner-uuid-1',
        userId: 'client-user-1',
        raffleId: mockRaffleId,
        ticketId: 'ticket-1',
        winType: 'MAIN_DRAW',
        prizeName: 'Precision Rifle Sweepstakes',
        deliveryStatus: 'PENDING_CONTACT',
        createdAt: new Date(),
        user: { id: 'client-user-1', firstName: 'Winner', lastName: 'User', email: 'winner@gmail.com' },
        ticket: { id: 'ticket-1', ticketNumber: 42 },
      };

      // Mock interactive transaction
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          raffle: {
            findUnique: jest.fn().mockResolvedValue(activeRaffleWithTickets),
            update: jest.fn().mockResolvedValue({ ...activeRaffleWithTickets, status: 'ENDED' }),
          },
          winner: {
            create: jest.fn().mockResolvedValue(mockWinner),
          },
        });
      });

      const res = await request(app.getHttpServer())
        .post(`/api/v1/raffles/admin/${mockRaffleId}/draw`)
        .set('Cookie', adminSession.cookie)
        .send({ winningTicketNumber: 42 })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.winType).toBe('MAIN_DRAW');
      expect(res.body.data.ticketId).toBe('ticket-1');
    });
  });
});
