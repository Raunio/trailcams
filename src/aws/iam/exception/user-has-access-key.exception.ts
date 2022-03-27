import { HttpStatus } from '@nestjs/common';
import { StatusCode } from 'src/constants/status.code';
import { TrailException } from 'src/exception/trail.exception';

export class UserHasAccessKeyException extends TrailException {
    constructor(username: string) {
        super(
            `User '${username}' already has an access key.`,
            HttpStatus.FORBIDDEN,
            StatusCode.USER_HAS_ACCESS_KEY,
        );
    }
}
