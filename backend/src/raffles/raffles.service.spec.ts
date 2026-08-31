import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { RafflesService } from './raffles.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, MockPrismaService } from '../../test/helpers/prisma-mock.helper';

describe('RafflesService', () => {
  let service: RafflesService;
  let prismaMock: MockPrismaService;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RafflesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<RafflesService>(RafflesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if host profile does not exist', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue(null);

      await expect(
        service.create('user-1', { title: 'Test Raffle' }),
      ).rejects.toThrow(new BadRequestException('Host profile not found'));
    });

    it('should throw ForbiddenException if host has no active subscription', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue({
        id: 'host-1',
        userId: 'user-1',
        subscriptions: [],
        raffles: [],
      });

      await expect(
        service.create('user-1', { title: 'Test Raffle' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create raffle and return record on valid subscription', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue({
        id: 'host-1',
        userId: 'user-1',
        subscriptions: [
          {
            id: 'sub-1',
            status: 'ACTIVE',
            plan: { name: 'Pro', maxActiveRaffles: 10 },
          },
        ],
        raffles: [],
      });

      const mockCreatedRaffle = {
        id: 'raffle-1',
        title: 'Custom Rifle Giveaway',
        slug: 'custom-rifle-giveaway-123456',
        status: 'PENDING',
      };
      prismaMock.raffle.create.mockResolvedValue(mockCreatedRaffle);

      const result = await service.create('user-1', {
        title: 'Custom Rifle Giveaway',
        description: 'High tier rifle',
        pricePerTicket: 5,
        totalTickets: 100,
        endDate: new Date().toISOString(),
      });

      expect(result.id).toBe('raffle-1');
      expect(result.status).toBe('PENDING');
    });
  });

  describe('drawWinner', () => {
    it('should throw NotFoundException if raffle does not exist', async () => {
      prismaMock.raffle.findUnique.mockResolvedValue(null);

      await expect(service.drawWinner('nonexistent-raffle')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
