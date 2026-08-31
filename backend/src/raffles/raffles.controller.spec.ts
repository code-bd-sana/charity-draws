import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RafflesController } from './raffles.controller';
import { RafflesService } from './raffles.service';

describe('RafflesController', () => {
  let controller: RafflesController;
  let service: {
    create: jest.Mock;
    drawWinner: jest.Mock;
    remove: jest.Mock;
    findAllPublic: jest.Mock;
  };
  let jwtService: JwtService;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      drawWinner: jest.fn(),
      remove: jest.fn(),
      findAllPublic: jest.fn(),
    };
    jwtService = new JwtService({ secret: 'test-secret' });
    controller = new RafflesController(service as unknown as RafflesService, jwtService);
  });

  it('delegates public raffle listings', () => {
    service.findAllPublic.mockReturnValue({ data: [] });

    expect(controller.findAllPublic({ page: 1 } as any)).toEqual({ data: [] });
    expect(service.findAllPublic).toHaveBeenCalledWith({ page: 1 });
  });

  it('extracts host user id when creating a raffle', () => {
    const accessToken = jwtService.sign({ sub: 'host-user-1', role: 'HOST' });
    service.create.mockReturnValue({ id: 'raffle-1' });

    expect(
      controller.create(
        { cookies: { accessToken } } as any,
        { title: 'Prize Draw' } as any,
      ),
    ).toEqual({ id: 'raffle-1' });
    expect(service.create).toHaveBeenCalledWith('host-user-1', {
      title: 'Prize Draw',
    });
  });

  it('rejects host actions without a cookie', () => {
    expect(() => controller.remove({ cookies: {} } as any, 'raffle-1')).toThrow(
      UnauthorizedException,
    );
  });

  it('delegates admin winner drawing with an explicit ticket number', () => {
    service.drawWinner.mockReturnValue({ id: 'winner-1' });

    expect(
      controller.adminDrawWinner({} as any, 'raffle-1', { winningTicketNumber: 42 }),
    ).toEqual({ id: 'winner-1' });
    expect(service.drawWinner).toHaveBeenCalledWith('raffle-1', 42);
  });
});
