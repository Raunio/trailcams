import { HttpStatus } from '@nestjs/common';
import { TrailException } from './trail.exception';

export class ServiceStateException extends TrailException {
    constructor(error: Error, message?: string) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
        this.innerException = error;
    }
}
