import { Test, TestingModule } from '@nestjs/testing';
import { AdminTicketAssignmentService } from './admin-ticket-assignment.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RafflesService } from '../../raffles/raffles.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AdminTicketAssignmentService', () => {
  let service: AdminTicketAssignmentService;
  let prisma: any;
  let rafflesService: any;
  let notificationsService: any;

  const mockPrisma = {
    raffle: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    ticket: {
      findMany: jest.fn(),
      createMany: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    hostProfile: {
      update: jest.fn(),
    },
    instantWin: {
      update: jest.fn(),
    },
    winner: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockRafflesService = {
    drawWinner: jest.fn(),
  };

  const mockNotificationsService = {
    create: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminTicketAssignmentService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RafflesService, useValue: mockRafflesService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<AdminTicketAssignmentService>(AdminTicketAssignmentService);
    prisma = module.get(PrismaService);
    rafflesService = module.get(RafflesService);
    notificationsService = module.get(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getActiveCompetitions', () => {
    it('should return mapped active competitions', async () => {
      mockPrisma.raffle.findMany.mockResolvedValue([
        {
          id: 'raffle-1',
          title: 'Rolex Submariner',
          slug: 'rolex-submariner',
          category: 'Watches',
          mainImage: 'image.jpg',
          pricePerTicket: 10,
          totalTickets: 100,
          ticketsSold: 40,
          startDate: new Date(),
          endDate: new Date(),
          status: 'ACTIVE',
          isAutoDraw: true,
          autoDrawSoldOut: true,
          host: {
            id: 'host-1',
            businessName: 'Luxury Hosts',
            slug: 'luxury-hosts',
            user: {
              id: 'user-host',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              avatarUrl: null,
            },
          },
          instantWins: [
            { id: 'iw-1', ticketNumber: 7, prizeName: '£50 Cash', rrpValue: 50, isClaimed: true },
            { id: 'iw-2', ticketNumber: 14, prizeName: '£100 Cash', rrpValue: 100, isClaimed: false },
          ],
        },
      ]);

      const result = await service.getActiveCompetitions({});
      expect(result).toHaveLength(1);
      expect(result[0].remainingTickets).toBe(60);
      expect(result[0].instantWinCounts.total).toBe(2);
      expect(result[0].instantWinCounts.claimed).toBe(1);
      expect(result[0].instantWinCounts.unclaimed).toBe(1);
    });
  });

  describe('getCompetitionDetails', () => {
    it('should throw NotFoundException if raffle is missing', async () => {
      mockPrisma.raffle.findUnique.mockResolvedValue(null);
      await expect(service.getCompetitionDetails('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return competition details with sold tickets and instant wins', async () => {
      mockPrisma.raffle.findUnique.mockResolvedValue({
        id: 'raffle-1',
        title: 'Rolex Submariner',
        pricePerTicket: 10,
        totalTickets: 50,
        ticketsSold: 1,
        status: 'ACTIVE',
        host: null,
        instantWins: [
          { id: 'iw-1', ticketNumber: 5, prizeName: 'Silver Coin', rrpValue: 30, isClaimed: false, image: null },
        ],
        tickets: [
          {
            id: 't-1',
            ticketNumber: 1,
            createdAt: new Date(),
            userId: 'u-1',
            user: { id: 'u-1', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', avatarUrl: null },
            transaction: { paymentGateway: 'STRIPE', createdAt: new Date(), amount: 10 },
          },
        ],
      });

      const result = await service.getCompetitionDetails('raffle-1');
      expect(result.id).toBe('raffle-1');
      expect(result.soldTickets).toHaveLength(1);
      expect(result.soldTickets[0].paymentGateway).toBe('STRIPE');
      expect(result.instantWins).toHaveLength(1);
    });
  });

  describe('searchUsers', () => {
    it('should return mapped active users', async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: 'u-1',
          firstName: 'Alice',
          lastName: 'Wonder',
          email: 'alice@test.com',
          role: 'CLIENT',
          avatarUrl: 'alice.png',
        },
      ]);

      const result = await service.searchUsers('alice');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alice Wonder');
    });
  });

  describe('assignTickets', () => {
    it('should successfully assign specific tickets and claim instant win', async () => {
      const mockTx = {
        raffle: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'raffle-1',
            title: 'Rolex Submariner',
            pricePerTicket: 10,
            totalTickets: 100,
            ticketsSold: 10,
            status: 'ACTIVE',
            hostId: 'host-1',
            instantWins: [
              { id: 'iw-7', ticketNumber: 7, prizeName: '£50 Voucher', rrpValue: 50, isClaimed: false },
            ],
            host: { userId: 'host-user-id' },
          }),
          update: jest.fn().mockResolvedValue({
            id: 'raffle-1',
            title: 'Rolex Submariner',
            ticketsSold: 11,
            totalTickets: 100,
            status: 'ACTIVE',
            isAutoDraw: false,
          }),
        },
        user: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'user-1',
            email: 'user@test.com',
            firstName: 'Bob',
            lastName: 'Marley',
            isBlocked: false,
          }),
        },
        ticket: {
          findMany: jest
            .fn()
            .mockResolvedValueOnce([]) // sold tickets check
            .mockResolvedValueOnce([{ id: 't-created-7', ticketNumber: 7 }]), // created tickets
          createMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        transaction: {
          create: jest.fn().mockResolvedValue({
            id: 'trn-1',
            gatewayTransactionId: 'ADMIN_ASSIGN_123',
            paymentGateway: 'ADMIN_MANUAL',
            amount: 10,
            createdAt: new Date(),
            adminNotes: 'Promo prize',
          }),
        },
        instantWin: {
          update: jest.fn().mockResolvedValue({ id: 'iw-7', isClaimed: true }),
        },
        winner: {
          create: jest.fn().mockResolvedValue({ id: 'win-1' }),
        },
        hostProfile: {
          update: jest.fn().mockResolvedValue({}),
        },
        auditLog: {
          create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
        },
      };

      mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockTx));

      const res = await service.assignTickets(
        {
          raffleId: 'raffle-1',
          userId: 'user-1',
          ticketNumbers: [7],
          adminNotes: 'Promo prize',
        },
        'admin-id-1',
      );

      expect(res.success).toBe(true);
      expect(res.totalAmount).toBe(10);
      expect(res.instantWins).toHaveLength(1);
      expect(res.instantWins[0].prizeName).toBe('£50 Voucher');
      expect(mockTx.instantWin.update).toHaveBeenCalledWith({
        where: { id: 'iw-7' },
        data: { isClaimed: true },
      });
      expect(mockTx.hostProfile.update).toHaveBeenCalledWith({
        where: { id: 'host-1' },
        data: { walletBalance: { increment: 10 } },
      });
      expect(mockNotificationsService.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if ticket number is already sold', async () => {
      const mockTx = {
        raffle: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'raffle-1',
            totalTickets: 100,
            ticketsSold: 10,
            status: 'ACTIVE',
            instantWins: [],
          }),
        },
        user: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'user-1',
            isBlocked: false,
          }),
        },
        ticket: {
          findMany: jest.fn().mockResolvedValue([{ ticketNumber: 7 }]),
        },
      };

      mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockTx));

      await expect(
        service.assignTickets(
          {
            raffleId: 'raffle-1',
            userId: 'user-1',
            ticketNumbers: [7],
          },
          'admin-id',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
