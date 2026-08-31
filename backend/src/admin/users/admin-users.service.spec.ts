import { Test, TestingModule } from '@nestjs/testing';
import { AdminUsersService } from './admin-users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createPrismaMock, MockPrismaService } from '../../../test/helpers/prisma-mock.helper';

describe('AdminUsersService', () => {
  let service: AdminUsersService;
  let prismaMock: MockPrismaService;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AdminUsersService>(AdminUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return paginated list of users', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user@example.com',
          firstName: 'User',
          lastName: 'One',
          role: 'CLIENT',
          isEmailVerified: true,
          isBlocked: false,
          createdAt: new Date(),
          _count: { tickets: 3 },
          transactions: [{ amount: 15.0 }],
        },
      ];
      prismaMock.user.findMany.mockResolvedValue(mockUsers);
      prismaMock.user.count.mockResolvedValue(1);

      const result = await service.getUsers(1, 10);
      expect(result.users).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.users[0].firstName).toBe('User');
      expect(result.users[0].lastName).toBe('One');
    });
  });
});
