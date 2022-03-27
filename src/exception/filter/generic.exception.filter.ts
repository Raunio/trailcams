import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
} from '@nestjs/common';
import { TrailLogger } from 'src/logger/trail.logger';
import { Response } from 'express';
import { TrailApiResponse } from 'src/domain/trail.api.response';

/**
 * A fallback exception filter if the caught exception is not handled by any other filter.
 */
@Catch(Error)
export class GenericExceptionFilter implements ExceptionFilter {
    private readonly logger: TrailLogger = new TrailLogger(
        GenericExceptionFilter.name,
    );

    catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        this.logger.error(
            request,
            `${GenericExceptionFilter.name} caught unhandled exception: ${exception.name}\n${exception.message}\n---------Stack trace---------\n${exception.stack}`,
        );

        const body: TrailApiResponse<null> = {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Ei pysty',
            timestamp: new Date().toISOString(),
        };

        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
    }
}
