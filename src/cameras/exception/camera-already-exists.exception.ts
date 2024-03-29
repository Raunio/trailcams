import { HttpStatus } from '@nestjs/common';
import { ResponseStatus } from 'src/constants/status.code';
import { TrailException } from 'src/exception/trail.exception';

export class CameraAlreadyExistsException extends TrailException {
    constructor(name: string) {
        const msg = `A camera with name '${name} is already exists for the user.`;
        super(
            msg,
            HttpStatus.BAD_REQUEST,
            ResponseStatus.ENTITY_ALREADY_EXISTS,
        );
    }
}
