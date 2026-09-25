import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../prisma/prisma.service';
import { RafflesService } from '../raffles/raffles.service';
import { createPrismaMock, MockPrismaService } from '../../test/helpers/prisma-mock.helper';

describe('TicketsService', () => {
  let service: TicketsService;
  let prismaMock: MockPrismaService;
  let rafflesServiceMock: any;

  beforeEach(async () => {
    prismaMock = createPrismaMock();
    rafflesServiceMock = {
      drawWinner: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: RafflesService,
          useValue: rafflesServiceMock,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('allocateTicketsInDatabase', () => {
    it('should throw BadRequestException if quantity is less than 1', async () => {
      await expect(
        service.allocateTicketsInDatabase('user-1', 'raffle-1', 0),
      ).rejects.toThrow(new BadRequestException('Quantity must be at least 1'));
    });

    it('should throw NotFoundException if competition is not found', async () => {
      prismaMock.raffle.findUnique.mockResolvedValue(null);

      await expect(
        service.allocateTicketsInDatabase('user-1', 'nonexistent-raffle', 2),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if competition is not ACTIVE', async () => {
      prismaMock.raffle.findUnique.mockResolvedValue({
        id: 'raffle-1',
        status: 'PENDING',
        ticketsSold: 0,
        totalTickets: 100,
        instantWins: [],
      });

      await expect(
        service.allocateTicketsInDatabase('user-1', 'raffle-1', 2),
      ).rejects.toThrow(new BadRequestException('This competition is not active'));
    });

    it('should throw BadRequestException if requested tickets exceed total tickets', async () => {
      prismaMock.raffle.findUnique.mockResolvedValue({
        id: 'raffle-1',
        status: 'ACTIVE',
        ticketsSold: 95,
        totalTickets: 100,
        instantWins: [],
      });

      await expect(
        service.allocateTicketsInDatabase('user-1', 'raffle-1', 10),
      ).rejects.toThrow(new BadRequestException('Only 5 tickets remaining'));
    });
  });
});
