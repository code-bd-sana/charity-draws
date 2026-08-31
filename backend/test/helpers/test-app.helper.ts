import {
  BadRequestException,
  INestApplication,
  ModuleMetadata,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from '../../src/common/filters/all-exceptions.filter';
import { TransformInterceptor } from '../../src/common/interceptors/transform.interceptor';

export async function createTestApp(
  metadata: ModuleMetadata,
  configure?: (builder: TestingModuleBuilder) => TestingModuleBuilder,
): Promise<INestApplication> {
  const builder = Test.createTestingModule(metadata);
  const moduleFixture = await (configure ? configure(builder) : builder).compile();
  const app = moduleFixture.createNestApplication();

  app.use(cookieParser());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          message: 'Validation failed',
          error: errors.map((error) => ({
            field: error.property,
            errors: Object.values(error.constraints || {}),
          })),
        }),
    }),
  );

  await app.init();
  return app;
}
