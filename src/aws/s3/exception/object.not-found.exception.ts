import { HttpStatus } from '@nestjs/common';
import { ResponseStatus } from 'src/constants/status.code';
import { TrailException } from 'src/exception/trail.exception';

export class ObjectNotFoundException extends TrailException {
    constructor(objectKey: string, bucket: string) {
        const msg = `Object with key '${objectKey}' could not be found`;
        super(
            msg + ` from bucket ${bucket}`,
            HttpStatus.NOT_FOUND,
            ResponseStatus.OBJECT_NOT_FOUND,
            msg,
        );
    }
}
