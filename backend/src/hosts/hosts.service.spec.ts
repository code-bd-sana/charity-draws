import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { HostsService } from './hosts.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, MockPrismaService } from '../../test/helpers/prisma-mock.helper';

describe('HostsService', () => {
  let service: HostsService;
  let prismaMock: MockPrismaService;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HostsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<HostsService>(HostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllVerifiedPublic', () => {
    it('should return list of verified hosts', async () => {
      const mockHosts = [
        {
          id: 'host-1',
          slug: 'tactical-host',
          businessName: 'Tactical Armory',
          bio: 'Best custom builds',
          bannerUrl: 'banner.jpg',
          logoUrl: 'logo.jpg',
          isVerified: true,
          user: {
            firstName: 'Tactical',
            lastName: 'Host',
            avatarUrl: 'avatar.jpg',
          },
          _count: {
            raffles: 3,
          },
        },
      ];

      prismaMock.hostProfile.findMany.mockResolvedValue(mockHosts);

      const result = await service.findAllVerifiedPublic();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Tactical Armory');
      expect(result[0].competitionCount).toBe(3);
    });
  });

  describe('getWalletStats', () => {
    it('should calculate available balance, fees, and lifetime earnings correctly', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue({
        id: 'host-1',
        userId: 'user-1',
        walletBalance: 250.0,
      });

      prismaMock.withdrawal.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 50.0 } }) // pending
        .mockResolvedValueOnce({ _sum: { amount: 100.0 } }); // completed

      prismaMock.raffle.findMany.mockResolvedValue([
        { pricePerTicket: 5, ticketsSold: 40 },
        { pricePerTicket: 10, ticketsSold: 10 },
      ]);

      const stats = await service.getWalletStats('user-1');
      expect(stats.availableBalance).toBe(250.0);
      expect(stats.pendingClearance).toBe(50.0);
      expect(stats.totalLifetimeEarnings).toBe(300.0);
      expect(stats.totalFeesPaid).toBe(10.0); // 100 * 0.10
      expect(stats.commissionRate).toBe(10.0);
    });
  });

  describe('requestWithdrawal', () => {
    it('should throw BadRequestException if amount is <= 0', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue({
        id: 'host-1',
        userId: 'user-1',
        walletBalance: 200.0,
      });

      await expect(
        service.requestWithdrawal('user-1', {
          amount: 0,
          payoutMethod: 'BANK_TRANSFER',
          payoutDetails: {},
        }),
      ).rejects.toThrow(new BadRequestException('Withdrawal amount must be greater than 0'));
    });

    it('should throw BadRequestException if amount exceeds available balance', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue({
        id: 'host-1',
        userId: 'user-1',
        walletBalance: 50.0,
      });

      await expect(
        service.requestWithdrawal('user-1', {
          amount: 100.0,
          payoutMethod: 'BANK_TRANSFER',
          payoutDetails: {},
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create pending withdrawal and deduct 10% fee', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue({
        id: 'host-1',
        userId: 'user-1',
        walletBalance: 200.0,
      });

      const mockWithdrawal = {
        id: 'w-1',
        hostId: 'host-1',
        amount: 100.0,
        feeAmount: 10.0,
        netAmount: 90.0,
        status: 'PENDING',
        payoutMethod: 'BANK_TRANSFER',
        createdAt: new Date(),
      };
      prismaMock.withdrawal.create.mockResolvedValue(mockWithdrawal);

      const result = await service.requestWithdrawal('user-1', {
        amount: 100.0,
        payoutMethod: 'BANK_TRANSFER',
        payoutDetails: { sortCode: '12-34-56', accountNumber: '12345678' },
      });

      expect(result.message).toBe('Withdrawal request submitted successfully');
      expect(result.withdrawal.grossAmount).toBe(100.0);
      expect(result.withdrawal.netAmount).toBe(90.0);
    });
  });
});
