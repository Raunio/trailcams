import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger(LoggerMiddleware.name);

    use(req: any, res: any, next: () => void) {
        this.logger.debug(
            `---> REQ: ${req.method} | ${req.originalUrl} | ${req.socket.remoteAddress}`,
        );

        res.on('finish', () => {
            this.logger.debug(`<--- RES: ${res.statusCode}`);
        });

        next();
    }
}
