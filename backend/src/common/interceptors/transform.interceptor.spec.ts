import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  it('wraps returned payloads in the standard API envelope', (done) => {
    const interceptor = new TransformInterceptor();

    interceptor
      .intercept({} as any, { handle: () => of({ id: 'raffle-1' }) })
      .subscribe((result) => {
        expect(result).toMatchObject({
          success: true,
          message: 'Request successful',
          data: { id: 'raffle-1' },
        });
        expect(result.timestamp).toEqual(expect.any(String));
        done();
      });
  });

  it('preserves explicit message, data, and meta fields', (done) => {
    const interceptor = new TransformInterceptor();

    interceptor
      .intercept({} as any, {
        handle: () => of({ message: 'ok', data: [1], meta: { total: 1 } }),
      })
      .subscribe((result) => {
        expect(result).toMatchObject({
          success: true,
          message: 'ok',
          data: [1],
          meta: { total: 1 },
        });
        done();
      });
  });
});
