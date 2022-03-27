import {
    Controller,
    Get,
    Put,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { Auth } from 'src/decorators/auth.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ImagesService } from './images.service';
import { AuthenticatedUser } from 'src/auth/authenticated.user';
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiNotFoundResponse,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';
import { UploadObjectPayload } from './images.upload-object.payload';
import { TrailApiResponse } from 'src/domain/trail.api.response';
import { S3ObjectDTO } from 'src/aws/s3/s3.object.dto';

@Controller('images')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ImagesController {
    constructor(private readonly imagesService: ImagesService) {}

    @Put('upload/pool')
    @UseInterceptors(FileInterceptor('image'))
    @ApiOperation({ description: 'Uploads an image to the pool bucket' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ type: UploadObjectPayload })
    async uploadToPool(
        @Auth() user: AuthenticatedUser,
        @UploadedFile() image: Express.Multer.File,
    ) {
        return new TrailApiResponse<UploadObjectPayload>(
            await this.imagesService.uploadToPool(user, image),
        );
    }

    @Put('upload/user')
    @UseInterceptors(FileInterceptor('image'))
    @ApiOperation({
        description:
            'Uploads an image file to the users bucket. Supported file types are image/png, image/jpg, image/jpeg',
    })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ type: UploadObjectPayload })
    async upload(
        @Auth() user: AuthenticatedUser,
        @UploadedFile() image: Express.Multer.File,
    ) {
        return new TrailApiResponse<UploadObjectPayload>(
            await this.imagesService.uploadToUserBucket(user, image),
        );
    }

    @Get('list')
    @ApiOperation({
        description: 'Fetches a list of object keys from the users bucket',
    })
    @ApiResponse({ type: S3ObjectDTO })
    async listObjects(
        @Query('cameraName') cameraName: string,
        @Auth() user: AuthenticatedUser,
    ) {
        return new TrailApiResponse<S3ObjectDTO[]>(
            await this.imagesService.listObjects(user, cameraName),
        );
    }

    @Get()
    @ApiOperation({ description: 'Gets a single object from the users bucket' })
    @ApiResponse({ type: S3ObjectDTO })
    @ApiNotFoundResponse({
        type: ApiResponse,
        description: 'Returns 404 when object with given key is not found.',
    })
    async getObject(
        @Query('key') key: string,
        @Auth() user: AuthenticatedUser,
        @Query('thumbnail') thumbnail?: boolean,
    ) {
        return new TrailApiResponse<S3ObjectDTO>(
            await this.imagesService.getObject(user, key, thumbnail),
        );
    }
}
