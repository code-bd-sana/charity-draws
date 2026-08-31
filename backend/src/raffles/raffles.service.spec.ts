import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { RafflesService } from './raffles.service';
import { createPrismaMock, MockPrismaService } from '../../test/helpers/prisma-mock.helper';

describe('RafflesService', () => {
  let service: RafflesService;
  let prisma: MockPrismaService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new RafflesService(prisma as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('enforces active subscription raffle quotas during creation', async () => {
    prisma.hostProfile.findUnique.mockResolvedValue({
      id: 'host-1',
      subscriptions: [{ plan: { name: 'Starter', maxActiveRaffles: 1 } }],
      raffles: [{ status: 'ACTIVE' }],
    });

    await expect(
      service.create('host-user-1', {
        title: 'Prize Draw',
        startDate: new Date(),
        endDate: new Date(),
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('creates raffles pending approval with instant-win ticket assignments', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    prisma.hostProfile.findUnique.mockResolvedValue({
      id: 'host-1',
      subscriptions: [{ plan: { name: 'Pro', maxActiveRaffles: 5 } }],
      raffles: [],
    });
    prisma.raffle.create.mockResolvedValue({ id: 'raffle-1', title: 'Prize Draw' });

    await service.create('host-user-1', {
      title: 'Prize Draw',
      ticketPrice: 2,
      totalTickets: 10,
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-02-01T00:00:00.000Z',
      instantWins: [{ prizeName: 'Bonus', rrpValue: 25 }],
    });

    expect(prisma.raffle.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        hostId: 'host-1',
        status: 'PENDING_APPROVAL',
        pricePerTicket: 2,
      }),
    });
    expect(prisma.instantWin.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          raffleId: 'raffle-1',
          prizeName: 'Bonus',
          ticketNumber: expect.any(Number),
        }),
      ],
    });
  });

  it('rejects drawing a winner when zero tickets have been sold', async () => {
    prisma.raffle.findUnique.mockResolvedValue({
      id: 'raffle-1',
      winners: [],
      tickets: [],
    });

    await expect(service.drawWinner('raffle-1')).rejects.toThrow(
      'Cannot draw a winner',
    );
  });

  it('prevents duplicate main winner draws', async () => {
    prisma.raffle.findUnique.mockResolvedValue({
      id: 'raffle-1',
      winners: [{ winType: 'MAIN_DRAW' }],
      tickets: [{ id: 'ticket-1', userId: 'user-1', ticketNumber: 1 }],
    });

    await expect(service.drawWinner('raffle-1')).rejects.toThrow(
      'already been drawn',
    );
  });

  it('draws a specified sold ticket and ends the raffle', async () => {
    prisma.raffle.findUnique.mockResolvedValue({
      id: 'raffle-1',
      title: 'Prize Draw',
      prizeName: 'Main Prize',
      winners: [],
      tickets: [
        { id: 'ticket-1', userId: 'user-1', ticketNumber: 7 },
        { id: 'ticket-2', userId: 'user-2', ticketNumber: 8 },
      ],
    });
    prisma.winner.create.mockResolvedValue({ id: 'winner-1', ticketId: 'ticket-1' });

    await expect(service.drawWinner('raffle-1', 7)).resolves.toEqual({
      id: 'winner-1',
      ticketId: 'ticket-1',
    });
    expect(prisma.winner.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        ticketId: 'ticket-1',
        winType: 'MAIN_DRAW',
      }),
      include: { user: true, ticket: true },
    });
    expect(prisma.raffle.update).toHaveBeenCalledWith({
      where: { id: 'raffle-1' },
      data: { status: 'ENDED' },
    });
  });

  it('deletes a host raffle and dependent records in one transaction', async () => {
    prisma.hostProfile.findUnique.mockResolvedValue({ id: 'host-1' });
    prisma.raffle.findFirst.mockResolvedValue({ id: 'raffle-1', hostId: 'host-1' });
    prisma.raffle.delete.mockResolvedValue({ id: 'raffle-1' });

    await expect(service.remove('raffle-1', 'host-user-1')).resolves.toEqual({
      id: 'raffle-1',
    });
    expect(prisma.winner.deleteMany).toHaveBeenCalledWith({ where: { raffleId: 'raffle-1' } });
    expect(prisma.ticket.deleteMany).toHaveBeenCalledWith({ where: { raffleId: 'raffle-1' } });
    expect(prisma.instantWin.deleteMany).toHaveBeenCalledWith({ where: { raffleId: 'raffle-1' } });
  });

  it('throws not found for missing public raffles', async () => {
    prisma.raffle.findFirst.mockResolvedValue(null);

    await expect(service.findOnePublic('missing-slug')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
