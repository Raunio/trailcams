import { HttpStatus } from '@nestjs/common';
import { ResponseStatus } from 'src/constants/status.code';
import { TrailException } from '../../exception/trail.exception';

export class FiletypeNotSupportedException extends TrailException {
    constructor(filetype: string) {
        super(
            `Filetype '${filetype}' is not supported'`,
            HttpStatus.BAD_REQUEST,
            ResponseStatus.FILETYPE_NOT_SUPPORTED,
        );
    }
}
