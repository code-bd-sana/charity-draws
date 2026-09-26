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

  describe('checkout', () => {
    it('should throw BadRequestException if basket items array is empty', async () => {
      const mockCheckoutDto: any = {
        items: [],
        contactInfo: { firstName: 'John', lastName: 'Doe', email: 'j@d.com', phone: '123' },
        shippingAddress: { addressLine1: '10 St', city: 'London', postalCode: 'W1' },
      };

      await expect(
        service.checkout('user-1', mockCheckoutDto),
      ).rejects.toThrow(new BadRequestException('Basket is empty'));
    });

    it('should process items and update user address during checkout', async () => {
      const mockCheckoutDto: any = {
        items: [{ raffleId: 'raffle-1', quantity: 2 }],
        contactInfo: { firstName: 'John', lastName: 'Doe', email: 'j@d.com', phone: '123' },
        shippingAddress: { addressLine1: '10 St', city: 'London', postalCode: 'W1', country: 'United Kingdom' },
      };

      prismaMock.user.update.mockResolvedValue({ id: 'user-1' });

      jest.spyOn(service, 'allocateTicketsInDatabase').mockResolvedValue({
        message: 'Tickets purchased successfully',
        tickets: [{ id: 't-1', ticketNumber: 10 }, { id: 't-2', ticketNumber: 20 }],
        instantWins: [],
        transaction: { amount: 10 },
      } as any);

      const result = await service.checkout('user-1', mockCheckoutDto);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '123',
          location: 'London',
          address: '10 St, London, W1, United Kingdom',
        },
      });

      expect(result.success).toBe(true);
      expect(result.tickets).toHaveLength(2);
      expect(result.totalAmount).toBe(10);
    });
  });
});
