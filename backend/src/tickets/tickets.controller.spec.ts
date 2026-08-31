import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

describe('TicketsController', () => {
  let controller: TicketsController;
  let ticketsService: { purchaseTickets: jest.Mock; getUserTickets: jest.Mock };
  let jwtService: JwtService;

  beforeEach(() => {
    ticketsService = {
      purchaseTickets: jest.fn(),
      getUserTickets: jest.fn(),
    };
    jwtService = new JwtService({ secret: 'test-secret' });
    controller = new TicketsController(ticketsService as unknown as TicketsService, jwtService);
  });

  it('requires a positive quantity before purchasing', async () => {
    await expect(
      controller.purchaseTickets({ cookies: {} } as any, 'raffle-1', { quantity: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('extracts the authenticated user id and purchases tickets', async () => {
    const accessToken = jwtService.sign({ sub: 'user-1', role: 'CLIENT' });
    ticketsService.purchaseTickets.mockResolvedValue({ message: 'Tickets purchased successfully' });

    await expect(
      controller.purchaseTickets(
        { cookies: { accessToken } } as any,
        'raffle-1',
        { quantity: 2 },
      ),
    ).resolves.toEqual({ message: 'Tickets purchased successfully' });

    expect(ticketsService.purchaseTickets).toHaveBeenCalledWith('user-1', 'raffle-1', 2);
  });

  it('rejects missing auth cookies for my tickets', async () => {
    await expect(controller.getMyTickets({ cookies: {} } as any)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
