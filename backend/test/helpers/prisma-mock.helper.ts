import { PrismaClient } from '@prisma/client';

export type MockModel = {
  findUnique: jest.Mock;
  findFirst: jest.Mock;
  findMany: jest.Mock;
  create: jest.Mock;
  createMany: jest.Mock;
  update: jest.Mock;
  updateMany: jest.Mock;
  delete: jest.Mock;
  deleteMany: jest.Mock;
  count: jest.Mock;
  aggregate: jest.Mock;
  groupBy: jest.Mock;
  fields?: Record<string, any>;
};

export type MockPrismaTransaction = MockPrismaService;

export const createMockModel = (): MockModel => ({
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  createMany: jest.fn(),
  update: jest.fn(),
  updateMany: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
  count: jest.fn(),
  aggregate: jest.fn(),
  groupBy: jest.fn(),
});

export type MockPrismaService = {
  user: MockModel;
  hostProfile: MockModel;
  subscriptionPlan: MockModel;
  hostSubscription: MockModel;
  raffle: MockModel;
  instantWin: MockModel;
  transaction: MockModel;
  ticket: MockModel;
  winner: MockModel;
  withdrawal: MockModel;
  category: MockModel;
  $transaction: jest.Mock;
  $connect: jest.Mock;
  $disconnect: jest.Mock;
};

export const createPrismaMock = (): MockPrismaService => {
  const mock: any = {
    user: createMockModel(),
    hostProfile: createMockModel(),
    subscriptionPlan: createMockModel(),
    hostSubscription: createMockModel(),
    raffle: {
      ...createMockModel(),
      fields: {
        totalTickets: 'totalTickets',
      },
    },
    instantWin: createMockModel(),
    transaction: createMockModel(),
    ticket: createMockModel(),
    winner: createMockModel(),
    withdrawal: createMockModel(),
    category: createMockModel(),
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
  };

  mock.$transaction = jest.fn((arg: any) => {
    if (typeof arg === 'function') {
      return arg(mock);
    }
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }
    return Promise.resolve(arg);
  });

  return mock as MockPrismaService;
};
