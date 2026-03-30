import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const message = String(exception?.message || '');
    const code = String(exception?.code || exception?.errorCode || '');

    // Keep root cause visible in server logs for production debugging.
    // eslint-disable-next-line no-console
    console.error('[GlobalExceptionFilter]', {
      name: exception?.name,
      code,
      message,
      stack: exception?.stack,
    });

    const isDatabaseUnavailable =
      code === 'P1001' ||
      message.includes('P1001') ||
      message.includes("Can't reach database server") ||
      message.toLowerCase().includes('database is unavailable');

    if (isDatabaseUnavailable) {
      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Database is unavailable. Please try again shortly.',
        code: 'P1001',
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      response.status(status).json(
        typeof payload === 'object' && payload !== null
          ? payload
          : { statusCode: status, message: String(payload) },
      );
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
