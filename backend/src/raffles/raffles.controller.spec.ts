import { Test, TestingModule } from '@nestjs/testing';
import { RafflesController } from './raffles.controller';
import { RafflesService } from './raffles.service';
import { JwtService } from '@nestjs/jwt';

describe('RafflesController', () => {
  let controller: RafflesController;
  let rafflesService: any;
  let jwtService: any;

  beforeEach(async () => {
    rafflesService = {
      create: jest.fn(),
      findAllPublic: jest.fn(),
      findOnePublic: jest.fn(),
      findHostRaffles: jest.fn(),
      update: jest.fn(),
      drawWinner: jest.fn(),
      delete: jest.fn(),
    };

    jwtService = {
      verify: jest.fn().mockReturnValue({ sub: 'host-123' }),
      verifyAsync: jest.fn().mockResolvedValue({ sub: 'host-123' }),
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RafflesController],
      providers: [
        {
          provide: RafflesService,
          useValue: rafflesService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    controller = module.get<RafflesController>(RafflesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllPublic', () => {
    it('should call rafflesService.findAllPublic with query params', async () => {
      const mockResult = { data: [], total: 0 };
      rafflesService.findAllPublic.mockResolvedValue(mockResult);

      const result = await controller.findAllPublic({ page: 1, limit: 12 });
      expect(result).toEqual(mockResult);
      expect(rafflesService.findAllPublic).toHaveBeenCalledWith({ page: 1, limit: 12 });
    });
  });

  describe('create', () => {
    it('should extract hostId and call rafflesService.create', async () => {
      const mockReq: any = {
        cookies: { accessToken: 'valid-host-token' },
      };
      const createDto = {
        title: 'Tactical Loadout',
        pricePerTicket: 10,
        totalTickets: 50,
      };
      const mockCreated = { id: 'raffle-1', ...createDto };
      rafflesService.create.mockResolvedValue(mockCreated);

      const result = await controller.create(mockReq, createDto as any);
      expect(result).toEqual(mockCreated);
      expect(rafflesService.create).toHaveBeenCalledWith('host-123', createDto);
    });
  });
});
