import { Test, TestingModule } from '@nestjs/testing';
import { DrawSchedulerService } from './draw-scheduler.service';
import { PrismaService } from '../prisma/prisma.service';
import { RafflesService } from './raffles.service';
import { createPrismaMock, MockPrismaService } from '../../test/helpers/prisma-mock.helper';

describe('DrawSchedulerService', () => {
  let service: DrawSchedulerService;
  let prismaMock: MockPrismaService;
  let rafflesServiceMock: any;

  beforeEach(async () => {
    prismaMock = createPrismaMock();
    rafflesServiceMock = {
      drawWinner: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DrawSchedulerService,
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

    service = module.get<DrawSchedulerService>(DrawSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleAutoDraws', () => {
    it('should trigger drawWinner for eligible auto-draw competitions', async () => {
      const eligibleRaffles = [
        { id: 'raffle-1', title: 'Auto Draw 1', isAutoDraw: true },
        { id: 'raffle-2', title: 'Auto Draw 2', isAutoDraw: true },
      ];
      prismaMock.raffle.findMany
        .mockResolvedValueOnce(eligibleRaffles) // auto-draw query
        .mockResolvedValueOnce([]); // manual-draw query

      await service.handleAutoDraws();

      expect(rafflesServiceMock.drawWinner).toHaveBeenCalledTimes(2);
      expect(rafflesServiceMock.drawWinner).toHaveBeenCalledWith('raffle-1');
      expect(rafflesServiceMock.drawWinner).toHaveBeenCalledWith('raffle-2');
    });

    it('should close expired manual-draw competitions', async () => {
      const manualRaffles = [{ id: 'manual-1', isAutoDraw: false }];
      prismaMock.raffle.findMany
        .mockResolvedValueOnce([]) // auto-draw query
        .mockResolvedValueOnce(manualRaffles); // manual-draw query

      prismaMock.raffle.update.mockResolvedValue({ id: 'manual-1', status: 'ENDED' });

      await service.handleAutoDraws();

      expect(prismaMock.raffle.update).toHaveBeenCalledWith({
        where: { id: 'manual-1' },
        data: { status: 'ENDED' },
      });
    });
  });
});
