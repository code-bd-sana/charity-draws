import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AdminOrdersController } from '../src/admin/orders/admin-orders.controller';
import { AdminOrdersService } from '../src/admin/orders/admin-orders.service';
import { AdminUsersController } from '../src/admin/users/admin-users.controller';
import { AdminUsersService } from '../src/admin/users/admin-users.service';
import { AdminWithdrawalsController } from '../src/admin/withdrawals/admin-withdrawals.controller';
import { AdminWithdrawalsService } from '../src/admin/withdrawals/admin-withdrawals.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { HostsController } from '../src/hosts/hosts.controller';
import { HostsService } from '../src/hosts/hosts.service';
import { createAuthCookie, createJwtService } from './helpers/auth-fixture.helper';
import { createTestApp } from './helpers/test-app.helper';

describe('Host financials & admin operations (e2e)', () => {
  let app: any;
  let jwtService: JwtService;
  let hostsService: { requestWithdrawal: jest.Mock; getWalletStats: jest.Mock };
  let adminWithdrawalsService: { updateStatus: jest.Mock; findAll: jest.Mock };
  let adminOrdersService: { processRefund: jest.Mock; getAllOrders: jest.Mock; getOrdersStats: jest.Mock };
  let adminUsersService: { toggleBlockStatus: jest.Mock; getUsers: jest.Mock; getStats: jest.Mock };

  beforeEach(async () => {
    jwtService = createJwtService();
    hostsService = {
      requestWithdrawal: jest.fn().mockResolvedValue({
        message: 'Withdrawal request submitted successfully',
        withdrawal: { id: 'withdrawal-1', grossAmount: 100, feeAmount: 10, netAmount: 90 },
      }),
      getWalletStats: jest.fn().mockResolvedValue({ availableBalance: 100 }),
    };
    adminWithdrawalsService = {
      updateStatus: jest.fn().mockResolvedValue({ id: 'withdrawal-1', status: 'REJECTED' }),
      findAll: jest.fn().mockResolvedValue([]),
    };
    adminOrdersService = {
      processRefund: jest.fn().mockResolvedValue({
        message: 'Refund processed successfully',
        transaction: { id: 'tx-1', status: 'REFUNDED' },
      }),
      getAllOrders: jest.fn().mockResolvedValue({ orders: [] }),
      getOrdersStats: jest.fn().mockResolvedValue({ totalOrders: 0 }),
    };
    adminUsersService = {
      toggleBlockStatus: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        isBlocked: true,
      }),
      getUsers: jest.fn().mockResolvedValue({ users: [] }),
      getStats: jest.fn().mockResolvedValue({ totalUsers: 0 }),
    };

    app = await createTestApp({
      controllers: [
        HostsController,
        AdminWithdrawalsController,
        AdminOrdersController,
        AdminUsersController,
      ],
      providers: [
        JwtAuthGuard,
        RolesGuard,
        Reflector,
        { provide: JwtService, useValue: jwtService },
        { provide: HostsService, useValue: hostsService },
        { provide: AdminWithdrawalsService, useValue: adminWithdrawalsService },
        { provide: AdminOrdersService, useValue: adminOrdersService },
        { provide: AdminUsersService, useValue: adminUsersService },
      ],
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it('submits host withdrawals and exposes fee calculations', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/hosts/withdraw')
      .set('Cookie', createAuthCookie('HOST', { sub: 'host-user-1' }, jwtService))
      .send({
        amount: 100,
        payoutMethod: 'BANK_TRANSFER',
        payoutDetails: { account: '12345678' },
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.withdrawal).toMatchObject({
          grossAmount: 100,
          feeAmount: 10,
          netAmount: 90,
        });
      });
  });

  it('rejects non-admin users from admin operations', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/admin/orders/tx-1/refund')
      .set('Cookie', createAuthCookie('CLIENT', { sub: 'client-1' }, jwtService))
      .send({ reason: 'duplicate' })
      .expect(403);
  });

  it('allows admins to reject withdrawals, refund orders, and block users', async () => {
    const adminCookie = createAuthCookie('ADMIN', { sub: 'admin-1' }, jwtService);

    await request(app.getHttpServer())
      .patch('/api/v1/admin/withdrawals/withdrawal-1/status')
      .set('Cookie', adminCookie)
      .send({ status: 'REJECTED', adminNotes: 'Invalid details' })
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toMatchObject({ status: 'REJECTED' });
      });

    await request(app.getHttpServer())
      .post('/api/v1/admin/orders/tx-1/refund')
      .set('Cookie', adminCookie)
      .send({ reason: 'Customer request' })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.transaction.status).toBe('REFUNDED');
      });

    await request(app.getHttpServer())
      .patch('/api/v1/admin/users/user-1/block')
      .set('Cookie', adminCookie)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.isBlocked).toBe(true);
      });
  });
});
