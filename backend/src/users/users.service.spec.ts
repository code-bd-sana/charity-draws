import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, MockPrismaService } from '../../test/helpers/prisma-mock.helper';

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock: MockPrismaService;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('changePassword', () => {
    it('should throw NotFoundException if user is not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword('nonexistent-id', {
          currentPassword: 'old',
          newPassword: 'new',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if current password is incorrect', async () => {
      const passwordHash = await bcrypt.hash('correctPassword', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        passwordHash,
      });

      await expect(
        service.changePassword('user-1', {
          currentPassword: 'wrongPassword',
          newPassword: 'newPassword123',
        }),
      ).rejects.toThrow(new BadRequestException('Invalid current password'));
    });

    it('should update password and return success message', async () => {
      const passwordHash = await bcrypt.hash('correctPassword', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        passwordHash,
      });
      prismaMock.user.update.mockResolvedValue({ id: 'user-1' });

      const result = await service.changePassword('user-1', {
        currentPassword: 'correctPassword',
        newPassword: 'newPassword123',
      });

      expect(result).toEqual({ message: 'Password updated successfully' });
      expect(prismaMock.user.update).toHaveBeenCalled();
    });
  });

  describe('getMyWinners', () => {
    it('should return winning records for user', async () => {
      const mockWinners = [
        {
          id: 'win-1',
          prizeName: 'Tactical Scope',
          prizeType: 'INSTANT_WIN',
          cashValue: 150,
          wonAt: new Date(),
          deliveryStatus: 'PENDING',
          verificationStatus: 'VERIFIED',
          trackingNumber: null,
          raffle: {
            title: 'Rifle Draw',
            slug: 'rifle-draw',
            mainPrizeName: 'Rifle',
            mainPrizeValue: 1000,
            host: {
              businessName: 'Tactical Host',
            },
          },
          ticket: {
            ticketNumber: 42,
          },
        },
      ];
      prismaMock.winner.findMany.mockResolvedValue(mockWinners);

      const result = await service.getMyWinners('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].prizeName).toBe('Tactical Scope');
      expect(result[0].ticketNumber).toBe(42);
    });
  });

  describe('getUserDashboardOverview', () => {
    it('should calculate and return correct dashboard KPIs and entries', async () => {
      prismaMock.ticket.findMany.mockResolvedValue([
        {
          id: 't-1',
          createdAt: new Date(),
          raffle: {
            id: 'raf-1',
            title: 'Tactical Draw',
            slug: 'tactical-draw',
            mainImage: 'img.jpg',
            endDate: new Date(),
            status: 'ACTIVE',
            pricePerTicket: 5,
            host: { businessName: 'Host Alpha' },
          },
          winners: [],
        },
      ]);

      prismaMock.transaction.findMany.mockResolvedValue([
        {
          id: 'tx-1',
          type: 'TICKET_PURCHASE',
          amount: 15,
          createdAt: new Date(),
          status: 'COMPLETED',
        },
      ]);

      prismaMock.winner.findMany.mockResolvedValue([]);

      const result = await service.getUserDashboardOverview('user-1');
      expect(result.kpi.totalTickets).toBe(1);
      expect(result.kpi.activeEntriesCount).toBe(1);
      expect(result.kpi.totalSpent).toBe(15);
      expect(result.activeEntries).toHaveLength(1);
      expect(result.activeEntries[0].title).toBe('Tactical Draw');
    });
  });

  describe('getMyTransactions', () => {
    it('should return formatted user transactions', async () => {
      prismaMock.transaction.findMany.mockResolvedValue([
        {
          id: '12345678-abcd',
          type: 'TICKET_PURCHASE',
          amount: 25,
          status: 'COMPLETED',
          paymentGateway: 'STRIPE',
          relatedEntityId: 'raf-1',
          createdAt: new Date(),
        },
      ]);
      prismaMock.raffle.findMany.mockResolvedValue([
        { id: 'raf-1', title: 'Rifle Draw', slug: 'rifle-draw', mainImage: null },
      ]);

      const result = await service.getMyTransactions('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].transactionId).toBe('#TRN-12345678');
      expect(result[0].amount).toBe(25);
      expect(result[0].raffleTitle).toBe('Rifle Draw');
    });
  });
});
