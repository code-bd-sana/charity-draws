import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { RafflesService } from '../raffles/raffles.service';
import { createPrismaMock, MockPrismaService } from '../../test/helpers/prisma-mock.helper';

describe('TicketsService', () => {
  let service: TicketsService;
  let prisma: MockPrismaService;
  let rafflesService: { drawWinner: jest.Mock };

  beforeEach(() => {
    process.env.USE_TEST_PAYMENT = 'true';
    prisma = createPrismaMock();
    rafflesService = { drawWinner: jest.fn() };
    service = new TicketsService(prisma as any, rafflesService as unknown as RafflesService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rejects non-positive ticket quantities', async () => {
    await expect(service.purchaseTickets('user-1', 'raffle-1', 0)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects purchase quantities exceeding remaining capacity without allocating tickets', async () => {
    prisma.raffle.findUnique.mockResolvedValue({
      id: 'raffle-1',
      status: 'ACTIVE',
      ticketsSold: 9,
      totalTickets: 10,
      instantWins: [],
    });

    await expect(
      service.allocateTicketsInDatabase('user-1', 'raffle-1', 2),
    ).rejects.toThrow('Only 1 tickets remaining');

    expect(prisma.ticket.createMany).not.toHaveBeenCalled();
    expect(prisma.transaction.create).not.toHaveBeenCalled();
  });

  it('allocates random available numbers, claims instant wins, and credits host wallet', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    prisma.raffle.findUnique.mockResolvedValue({
      id: 'raffle-1',
      hostId: 'host-1',
      status: 'ACTIVE',
      pricePerTicket: 5,
      totalTickets: 3,
      ticketsSold: 1,
      instantWins: [
        {
          id: 'instant-1',
          ticketNumber: 2,
          prizeName: 'Instant Prize',
          isClaimed: false,
        },
      ],
    });
    prisma.ticket.findMany
      .mockResolvedValueOnce([{ ticketNumber: 1 }])
      .mockResolvedValueOnce([
        {
          id: 'ticket-1',
          raffleId: 'raffle-1',
          userId: 'user-1',
          transactionId: 'transaction-1',
          ticketNumber: 2,
        },
      ]);
    prisma.transaction.create.mockResolvedValue({ id: 'transaction-1', amount: 5 });
    prisma.winner.create.mockResolvedValue({
      id: 'winner-1',
      winType: 'INSTANT_WIN',
      prizeName: 'Instant Prize',
    });
    prisma.raffle.update.mockResolvedValue({
      id: 'raffle-1',
      ticketsSold: 2,
      totalTickets: 3,
      status: 'ACTIVE',
      isAutoDraw: false,
      autoDrawSoldOut: false,
    });

    const result = await service.allocateTicketsInDatabase('user-1', 'raffle-1', 1);

    expect(prisma.ticket.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          raffleId: 'raffle-1',
          userId: 'user-1',
          ticketNumber: 2,
        }),
      ],
    });
    expect(prisma.instantWin.update).toHaveBeenCalledWith({
      where: { id: 'instant-1' },
      data: { isClaimed: true },
    });
    expect(prisma.hostProfile.update).toHaveBeenCalledWith({
      where: { id: 'host-1' },
      data: { walletBalance: { increment: 5 } },
    });
    expect(result.instantWins).toEqual([
      expect.objectContaining({ winType: 'INSTANT_WIN' }),
    ]);
  });

  it('triggers auto draw when an auto-draw raffle sells out', async () => {
    prisma.raffle.findUnique.mockResolvedValue({
      id: 'raffle-1',
      hostId: 'host-1',
      status: 'ACTIVE',
      pricePerTicket: 1,
      totalTickets: 1,
      ticketsSold: 0,
      instantWins: [],
    });
    prisma.ticket.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'ticket-1', ticketNumber: 1, userId: 'user-1' }]);
    prisma.transaction.create.mockResolvedValue({ id: 'transaction-1' });
    prisma.raffle.update.mockResolvedValue({
      id: 'raffle-1',
      ticketsSold: 1,
      totalTickets: 1,
      status: 'ACTIVE',
      isAutoDraw: true,
      autoDrawSoldOut: true,
    });

    await service.allocateTicketsInDatabase('user-1', 'raffle-1', 1);

    expect(rafflesService.drawWinner).toHaveBeenCalledWith('raffle-1');
  });
});
