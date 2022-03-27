import { HttpStatus } from '@nestjs/common';
import { StatusCode } from 'src/constants/status.code';
import { TrailException } from './trail.exception';

export class UserAlreadyExistsException extends TrailException {
    constructor(username: string) {
        const message = `User with name ${username} already exists.`;

        super(
            message,
            HttpStatus.BAD_REQUEST,
            StatusCode.USERNAME_ALREADY_EXISTS,
        );
    }
}
