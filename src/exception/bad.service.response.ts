import { HttpStatus } from '@nestjs/common';
import { TrailException } from './trail.exception';

export class BadServiceResponseException extends TrailException {
    constructor(message: string) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
