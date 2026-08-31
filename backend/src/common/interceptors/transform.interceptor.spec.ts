import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap response data in standard ApiResponse structure', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockData = { id: 1, name: 'Sample Item' };
    const mockCallHandler: CallHandler = {
      handle: () => of(mockData),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (response) => {
        expect(response.success).toBe(true);
        expect(response.data).toEqual(mockData);
        expect(response.message).toBe('Request successful');
        expect(response.timestamp).toBeDefined();
        done();
      },
      error: (err) => done(err),
    });
  });

  it('should preserve custom message and meta if provided in payload', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockPayload = {
      message: 'Items retrieved',
      data: [{ id: 1 }],
      meta: { total: 1 },
    };
    const mockCallHandler: CallHandler = {
      handle: () => of(mockPayload),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (response) => {
        expect(response.success).toBe(true);
        expect(response.message).toBe('Items retrieved');
        expect(response.data).toEqual([{ id: 1 }]);
        expect(response.meta).toEqual({ total: 1 });
        done();
      },
      error: (err) => done(err),
    });
  });
});
