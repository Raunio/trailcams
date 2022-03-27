import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    MulterModuleOptions,
    MulterOptionsFactory,
} from '@nestjs/platform-express';
import { ConfigConstants } from 'src/constants/config.constants';
import { FiletypeNotSupportedException } from 'src/images/exception/filetype-not-supported.exception';
import { TrailLogger } from 'src/logger/trail.logger';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
    private readonly logger: TrailLogger = new TrailLogger(
        MulterConfigService.name,
    );
    private readonly ACCEPTED_MIMETYPES = [];

    constructor(private readonly configService: ConfigService) {
        this.ACCEPTED_MIMETYPES = this.configService.get<string[]>(
            ConfigConstants.KEY_ACCEPTED_MIMETYPES,
        );
    }

    createMulterOptions(): MulterModuleOptions {
        return {
            fileFilter: (req, file, cb) => {
                if (
                    !file.mimetype ||
                    !this.ACCEPTED_MIMETYPES.includes(file.mimetype)
                ) {
                    return cb(
                        new FiletypeNotSupportedException(file.mimetype),
                        false,
                    );
                }

                this.logger.info(
                    req,
                    `Accepting file with type ${file.mimetype}`,
                );

                return cb(null, true);
            },
        };
    }
}
