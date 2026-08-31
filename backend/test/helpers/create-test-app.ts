import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { TransformInterceptor } from '../../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../../src/common/filters/all-exceptions.filter';
import { createPrismaMock, MockPrismaService } from './prisma-mock.helper';

export interface TestAppContext {
  app: INestApplication;
  prismaMock: MockPrismaService;
}

export async function createTestApp(): Promise<TestAppContext> {
  const prismaMock = createPrismaMock();

  // Setup default mock returns for common lookups
  prismaMock.raffle.findMany.mockResolvedValue([]);
  prismaMock.raffle.count.mockResolvedValue(0);
  prismaMock.user.count.mockResolvedValue(10);
  prismaMock.user.findMany.mockResolvedValue([]);
  prismaMock.hostProfile.count.mockResolvedValue(2);
  prismaMock.hostProfile.findMany.mockResolvedValue([]);
  prismaMock.transaction.aggregate.mockResolvedValue({ _sum: { amount: 500 } });
  prismaMock.withdrawal.findMany.mockResolvedValue([]);
  prismaMock.transaction.findMany.mockResolvedValue([]);

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(prismaMock)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.use(cookieParser());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.init();
  return { app, prismaMock };
}
