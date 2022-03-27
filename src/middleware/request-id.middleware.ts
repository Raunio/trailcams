import { Logger, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { HttpHeaders } from 'src/constants/http.headers';

/**
 * Checks if the Http header 'requestId' is present. If not, sets the
 * header with a random UUID value.
 */
export class RequestIdMiddleware implements NestMiddleware {
    private readonly logger: Logger = new Logger(RequestIdMiddleware.name);

    use(req: Request, res: any, next: () => void) {
        let requestId = req.headers[HttpHeaders.REQUEST_ID];
        if (!requestId) {
            requestId = randomUUID().toString();
            this.logger.debug(
                `Request header 'requestId' is not set. Assigning random UUID: ${requestId}`,
            );

            req.headers[HttpHeaders.REQUEST_ID] = requestId;
        }

        res.setHeader(HttpHeaders.REQUEST_ID, requestId);

        next();
    }
}
