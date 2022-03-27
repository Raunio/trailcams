import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { TrailApiResponse } from 'src/domain/trail.api.response';
import { TrailLogger } from 'src/logger/trail.logger';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger: TrailLogger = new TrailLogger(
        HttpExceptionFilter.name,
    );

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        // Probably don't want to log caught HttpExceptions in production
        this.logger.debug(
            request,
            `${HttpExceptionFilter.name} caught exception: ${exception.name}\n${exception.message}\n---------Stack trace---------\n${exception.stack}`,
        );

        const body: TrailApiResponse<null> = {
            message: exception.message,
            timestamp: new Date().toISOString(),
        };

        response.status(status).json(body);
    }
}
