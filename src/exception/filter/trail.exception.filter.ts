import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TrailLogger } from 'src/logger/trail.logger';
import { TrailException } from '../trail.exception';
import { Response } from 'express';
import { TrailApiResponse } from 'src/domain/trail.api.response';

@Catch(TrailException)
export class TrailExceptionFilfter implements ExceptionFilter {
    private readonly logger: TrailLogger = new TrailLogger(
        TrailExceptionFilfter.name,
    );

    catch(exception: TrailException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let message = `${TrailExceptionFilfter.name} caught exception: ${exception.message}\n---------Stack trace---------\n${exception.stack}`;

        const innerException = exception.getInnerException();
        if (innerException) {
            message += `\n---------Inner exception---------\n${innerException.stack}`;
        }

        this.logger.error(request, message);

        const body: TrailApiResponse<null> = {
            statusCode: exception.getBusinessStatus(),
            message: exception.getBusinessMessage(),
            timestamp: new Date().toISOString(),
        };

        response.status(exception.getStatus()).json(body);
    }
}
