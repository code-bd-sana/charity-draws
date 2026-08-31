import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

const createHost = () => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => ({ url: '/api/v1/test' }),
    }),
  } as any;

  return { host, response };
};

describe('AllExceptionsFilter', () => {
  it('formats HttpException responses', () => {
    const { host, response } = createHost();
    const filter = new AllExceptionsFilter();

    filter.catch(
      new BadRequestException({
        message: 'Validation failed',
        error: [{ field: 'email' }],
      }),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'email' }],
        path: '/api/v1/test',
      }),
    );
  });

  it('formats unexpected errors as internal server errors', () => {
    const { host, response } = createHost();
    const filter = new AllExceptionsFilter();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    filter.catch(new Error('boom'), host);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Internal server error',
        debug_error: 'boom',
      }),
    );

    spy.mockRestore();
  });
});
