import { HttpStatus } from '@nestjs/common';
import { ResponseStatus } from 'src/constants/status.code';
import { TrailException } from './trail.exception';

export class UserAlreadyExistsException extends TrailException {
    constructor(username: string) {
        const message = `User with name ${username} already exists.`;

        super(
            message,
            HttpStatus.BAD_REQUEST,
            ResponseStatus.USERNAME_ALREADY_EXISTS,
        );
    }
}
