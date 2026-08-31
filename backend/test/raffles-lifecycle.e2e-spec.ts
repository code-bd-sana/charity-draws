import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { RafflesController } from '../src/raffles/raffles.controller';
import { RafflesService } from '../src/raffles/raffles.service';
import { TicketsController } from '../src/tickets/tickets.controller';
import { TicketsService } from '../src/tickets/tickets.service';
import { createAuthCookie, createJwtService } from './helpers/auth-fixture.helper';
import { createTestApp } from './helpers/test-app.helper';

describe('Raffle lifecycle & ticket purchase (e2e)', () => {
  let app: any;
  let jwtService: JwtService;
  let rafflesService: {
    create: jest.Mock;
    approve: jest.Mock;
    findOnePublic: jest.Mock;
    drawWinner: jest.Mock;
    findHostRaffles: jest.Mock;
  };
  let ticketsService: { purchaseTickets: jest.Mock };

  beforeEach(async () => {
    jwtService = createJwtService();
    rafflesService = {
      create: jest.fn().mockResolvedValue({ id: 'raffle-1', status: 'PENDING_APPROVAL' }),
      approve: jest.fn().mockResolvedValue({ id: 'raffle-1', status: 'ACTIVE' }),
      findOnePublic: jest.fn().mockResolvedValue({ id: 'raffle-1', status: 'ACTIVE' }),
      drawWinner: jest.fn().mockResolvedValue({ id: 'winner-1', winType: 'MAIN_DRAW' }),
      findHostRaffles: jest.fn().mockResolvedValue({ data: [] }),
    };
    ticketsService = {
      purchaseTickets: jest.fn().mockResolvedValue({
        message: 'Tickets purchased successfully',
        tickets: [{ ticketNumber: 7 }],
        instantWins: [],
      }),
    };

    app = await createTestApp({
      controllers: [RafflesController, TicketsController],
      providers: [
        JwtAuthGuard,
        RolesGuard,
        Reflector,
        { provide: JwtService, useValue: jwtService },
        { provide: RafflesService, useValue: rafflesService },
        { provide: TicketsService, useValue: ticketsService },
      ],
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it('moves a host raffle through creation, approval, purchase, and winner draw endpoints', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/raffles')
      .set('Cookie', createAuthCookie('HOST', { sub: 'host-user-1' }, jwtService))
      .send({
        title: 'Lifecycle Draw',
        ticketPrice: 5,
        totalTickets: 100,
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-02-01T00:00:00.000Z',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.status).toBe('PENDING_APPROVAL');
      });

    await request(app.getHttpServer())
      .patch('/api/v1/raffles/admin/raffle-1/approve')
      .set('Cookie', createAuthCookie('ADMIN', { sub: 'admin-1' }, jwtService))
      .expect(200)
      .expect((res) => {
        expect(res.body.data.status).toBe('ACTIVE');
      });

    await request(app.getHttpServer())
      .post('/api/v1/tickets/purchase/raffle-1')
      .set('Cookie', createAuthCookie('CLIENT', { sub: 'client-1' }, jwtService))
      .send({ quantity: 1 })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.tickets).toEqual([{ ticketNumber: 7 }]);
      });

    await request(app.getHttpServer())
      .post('/api/v1/raffles/admin/raffle-1/draw')
      .set('Cookie', createAuthCookie('ADMIN', { sub: 'admin-1' }, jwtService))
      .send({ winningTicketNumber: 7 })
      .expect(201)
      .expect((res) => {
        expect(res.body.data).toMatchObject({ winType: 'MAIN_DRAW' });
      });
  });

  it('rejects purchases that exceed remaining capacity', async () => {
    ticketsService.purchaseTickets.mockRejectedValue(
      new BadRequestException('Only 1 tickets remaining'),
    );

    await request(app.getHttpServer())
      .post('/api/v1/tickets/purchase/raffle-1')
      .set('Cookie', createAuthCookie('CLIENT', { sub: 'client-1' }, jwtService))
      .send({ quantity: 2 })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe('Only 1 tickets remaining');
      });
  });
});
