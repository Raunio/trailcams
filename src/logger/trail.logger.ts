import { ConsoleLogger } from '@nestjs/common';
import { HttpHeaders } from 'src/constants/http.headers';

export class TrailLogger extends ConsoleLogger {
    debug(req: Request, message: string) {
        super.debug(this.buildMessage(req, message));
    }
    info(req: Request, message: string) {
        super.log(this.buildMessage(req, message));
    }

    error(req: Request, message: string) {
        super.error(this.buildMessage(req, message));
    }

    private buildMessage(req: Request, message: string) {
        const requestId = req.headers[HttpHeaders.REQUEST_ID];
        return `[${requestId}] ${message}`;
    }
}
