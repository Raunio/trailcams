import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { MulterConfigService } from 'src/multer/multer-config.service';
import { S3Service } from 'src/aws/s3/s3.service';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

@Module({
    imports: [MulterModule.registerAsync({ useClass: MulterConfigService })],
    providers: [ImagesService, S3Service, JwtStrategy],
    controllers: [ImagesController],
})
export class ImagesModule {}
