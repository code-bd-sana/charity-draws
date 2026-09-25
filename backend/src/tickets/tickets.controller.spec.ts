import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { JwtService } from '@nestjs/jwt';

describe('TicketsController', () => {
  let controller: TicketsController;
  let ticketsService: any;
  let jwtService: any;

  beforeEach(async () => {
    ticketsService = {
      purchaseTickets: jest.fn(),
      getUserTickets: jest.fn(),
      getSoldTicketsForHost: jest.fn(),
    };

    jwtService = {
      verify: jest.fn().mockReturnValue({ sub: 'user-123' }),
      verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-123' }),
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        {
          provide: TicketsService,
          useValue: ticketsService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('purchaseTickets', () => {
    it('should extract userId and call ticketsService.purchaseTickets', async () => {
      const mockReq: any = {
        cookies: { accessToken: 'valid-token' },
      };
      const mockResult = { success: true, count: 2, tickets: [] };
      ticketsService.purchaseTickets.mockResolvedValue(mockResult);

      const result = await controller.purchaseTickets(
        mockReq,
        'raffle-1',
        { quantity: 2 },
      );

      expect(result).toEqual(mockResult);
      expect(ticketsService.purchaseTickets).toHaveBeenCalledWith(
        'user-123',
        'raffle-1',
        2,
      );
    });
  });

  describe('getMyTickets', () => {
    it('should extract userId and return user ticket list', async () => {
      const mockReq: any = {
        cookies: { accessToken: 'valid-token' },
      };
      const mockTickets = [{ id: 'tkt-1', ticketNumber: 42 }];
      ticketsService.getUserTickets.mockResolvedValue(mockTickets);

      const result = await controller.getMyTickets(mockReq);
      expect(result).toEqual(mockTickets);
      expect(ticketsService.getUserTickets).toHaveBeenCalledWith('user-123');
    });
  });
});
