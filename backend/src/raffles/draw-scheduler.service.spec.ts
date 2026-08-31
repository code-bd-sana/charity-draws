import { DrawSchedulerService } from './draw-scheduler.service';
import { RafflesService } from './raffles.service';
import { createPrismaMock, MockPrismaService } from '../../test/helpers/prisma-mock.helper';

describe('DrawSchedulerService', () => {
  let service: DrawSchedulerService;
  let prisma: MockPrismaService;
  let rafflesService: { drawWinner: jest.Mock };

  beforeEach(() => {
    prisma = createPrismaMock();
    rafflesService = { drawWinner: jest.fn() };
    service = new DrawSchedulerService(prisma as any, rafflesService as unknown as RafflesService);
  });

  it('auto-draws active auto-draw raffles that are due', async () => {
    prisma.raffle.findMany
      .mockResolvedValueOnce([{ id: 'raffle-auto', title: 'Auto Draw' }])
      .mockResolvedValueOnce([]);

    await service.handleAutoDraws();

    expect(rafflesService.drawWinner).toHaveBeenCalledWith('raffle-auto');
  });

  it('closes manual draw raffles that are due without drawing', async () => {
    prisma.raffle.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'raffle-manual', title: 'Manual Draw' }]);

    await service.handleAutoDraws();

    expect(rafflesService.drawWinner).not.toHaveBeenCalled();
    expect(prisma.raffle.update).toHaveBeenCalledWith({
      where: { id: 'raffle-manual' },
      data: { status: 'ENDED' },
    });
  });
});
