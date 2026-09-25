import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-test-app';
import { MockPrismaService } from './helpers/prisma-mock.helper';
import { createClientSession } from './helpers/e2e-auth.helper';

describe('Ticket Purchase & Instant Win Allocation (e2e)', () => {
  let app: INestApplication;
  let prismaMock: MockPrismaService;

  const clientSession = createClientSession('client-user-uuid-1', 'client@charitydraws.co.uk');
  const mockRaffleId = 'raffle-uuid-e2e-active';

  const mockActiveRaffle = {
    id: mockRaffleId,
    hostId: 'host-uuid-1',
    title: 'Custom 4x4 Overland Rig',
    slug: 'custom-4x4-overland-rig',
    description: 'Win a fully built expedition 4x4 overland vehicle.',
    pricePerTicket: 25,
    totalTickets: 100,
    ticketsSold: 20,
    status: 'ACTIVE',
    isAutoDraw: false,
    autoDrawDate: false,
    autoDrawSoldOut: false,
    instantWins: [
      {
        id: 'iw-1',
        raffleId: mockRaffleId,
        ticketNumber: 7,
        prizeName: '£500 Cash Prize',
        isClaimed: false,
      },
    ],
  };

  beforeAll(async () => {
    const context = await createTestApp();
    app = context.app;
    prismaMock = context.prismaMock;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Multi-Ticket Purchase & Instant Win Verification', () => {
    it('Step 1: Reject ticket purchase without authentication token (401 Unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/tickets/purchase/${mockRaffleId}`)
        .send({ quantity: 2 })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('Step 2: Reject ticket purchase when quantity is zero or negative (400 Bad Request)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/tickets/purchase/${mockRaffleId}`)
        .set('Cookie', clientSession.cookie)
        .send({ quantity: 0 })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('Step 3: Authenticated client purchases 3 tickets and claims an Instant Win', async () => {
      const mockCreatedTickets = [
        { id: 't-1', raffleId: mockRaffleId, userId: clientSession.id, ticketNumber: 7, transactionId: 'tx-1' },
        { id: 't-2', raffleId: mockRaffleId, userId: clientSession.id, ticketNumber: 23, transactionId: 'tx-1' },
        { id: 't-3', raffleId: mockRaffleId, userId: clientSession.id, ticketNumber: 45, transactionId: 'tx-1' },
      ];

      const mockInstantWinner = {
        id: 'w-iw-1',
        userId: clientSession.id,
        raffleId: mockRaffleId,
        ticketId: 't-1',
        winType: 'INSTANT_WIN',
        prizeName: '£500 Cash Prize',
        deliveryStatus: 'PENDING',
      };

      // Mock transaction execution
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          raffle: {
            findUnique: jest.fn().mockResolvedValue(mockActiveRaffle),
            update: jest.fn().mockResolvedValue({ ...mockActiveRaffle, ticketsSold: 23 }),
          },
          ticket: {
            findMany: jest.fn().mockImplementation(({ where }) => {
              if (where?.transactionId) {
                return Promise.resolve(mockCreatedTickets);
              }
              return Promise.resolve([]);
            }),
            createMany: jest.fn().mockResolvedValue({ count: 3 }),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: 'tx-1',
              userId: clientSession.id,
              type: 'TICKET_PURCHASE',
              amount: 75,
              status: 'COMPLETED',
            }),
          },
          instantWin: {
            update: jest.fn().mockResolvedValue({ ...mockActiveRaffle.instantWins[0], isClaimed: true }),
          },
          winner: {
            create: jest.fn().mockResolvedValue(mockInstantWinner),
          },
          hostProfile: {
            update: jest.fn().mockResolvedValue({ id: 'host-uuid-1', walletBalance: 75 }),
          },
        });
      });

      const res = await request(app.getHttpServer())
        .post(`/api/v1/tickets/purchase/${mockRaffleId}`)
        .set('Cookie', clientSession.cookie)
        .send({ quantity: 3 })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.tickets).toHaveLength(3);
      expect(res.body.data.instantWins).toHaveLength(1);
      expect(res.body.data.instantWins[0].prizeName).toBe('£500 Cash Prize');
    });

    it('Step 4: GET /api/v1/tickets/my-tickets returns client purchased tickets and prizes', async () => {
      const mockUserTicketList = [
        {
          id: 't-1',
          ticketNumber: 7,
          raffle: {
            id: mockRaffleId,
            title: mockActiveRaffle.title,
            slug: mockActiveRaffle.slug,
            pricePerTicket: mockActiveRaffle.pricePerTicket,
            status: 'ACTIVE',
          },
          winners: [
            { id: 'w-iw-1', winType: 'INSTANT_WIN', prizeName: '£500 Cash Prize' },
          ],
        },
      ];

      prismaMock.ticket.findMany.mockResolvedValue(mockUserTicketList);

      const res = await request(app.getHttpServer())
        .get('/api/v1/tickets/my-tickets')
        .set('Cookie', clientSession.cookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].ticketNumber).toBe(7);
      expect(res.body.data[0].winners).toHaveLength(1);
    });

    it('Step 5: Reject purchase when requested tickets exceed remaining capacity (400 Bad Request)', async () => {
      const nearlySoldOutRaffle = {
        ...mockActiveRaffle,
        ticketsSold: 98,
        totalTickets: 100,
      };

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          raffle: {
            findUnique: jest.fn().mockResolvedValue(nearlySoldOutRaffle),
          },
        });
      });

      const res = await request(app.getHttpServer())
        .post(`/api/v1/tickets/purchase/${mockRaffleId}`)
        .set('Cookie', clientSession.cookie)
        .send({ quantity: 5 })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });
});
