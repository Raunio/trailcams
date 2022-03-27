import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigConstants } from 'src/constants/config.constants';
import { S3PutObjectRequest } from 'src/aws/s3/s3.put-object.request';
import { S3PutObjectResponse } from 'src/aws/s3/s3.put-object.response';
import { S3Service } from 'src/aws/s3/s3.service';
import { UploadObjectPayload } from './images.upload-object.payload';
import { AuthenticatedUser } from 'src/auth/authenticated.user';
import { ValidatorUtil } from 'src/util/validator.util';
import { ServiceStateException } from 'src/exception/service.state.exception';
import { S3ListObjectsResponse } from 'src/aws/s3/s3.list-objects.response';
import { MimetypesUtil } from 'src/util/mimetypes.util';
import { randomUUID } from 'node:crypto';
import { S3Constants } from 'src/aws/s3/s3.constants';
import { S3ListObjectsRequest } from 'src/aws/s3/s3.list-objects.request';
import { S3GetObjectRequest } from 'src/aws/s3/s3.get-object.request';
import { S3ObjectDTO } from 'src/aws/s3/s3.object.dto';

@Injectable()
export class ImagesService {
    private readonly logger = new Logger(ImagesService.name);

    constructor(
        private readonly s3Service: S3Service,
        private readonly configService: ConfigService,
    ) {}

    /**
     * Lists all objects in user's bucket
     * @param user Authenticated user
     * @param cameraName Optional parameter for filtering results based on camera name
     * @returns List of objects in user's bucket
     */
    async listObjects(
        user: AuthenticatedUser,
        cameraName?: string,
    ): Promise<S3ObjectDTO[]> {
        const s3req: S3ListObjectsRequest = new S3ListObjectsRequest({
            bucket: user.bucket,
        });

        if (cameraName) {
            s3req.prefix = cameraName + '/';
        }
        const s3listObjectsResponse: S3ListObjectsResponse =
            await this.s3Service.listObjects(s3req);

        return s3listObjectsResponse.objects;
    }

    /**
     * Gets an individual object from the user's bucket.
     * @param user Authenticated user
     * @param key Object key
     * @param thumbnail Boolean parameter to determine if the object should be fetched from the thumbnail bucket
     * @returns
     */
    async getObject(
        user: AuthenticatedUser,
        key: string,
        thumbnail?: boolean,
    ): Promise<S3ObjectDTO> {
        const bucket = thumbnail
            ? user.bucket + S3Constants.THUMBNAILS_BUCKET_POSTFIX
            : user.bucket;

        const s3GetObjectResponse = await this.s3Service.getObject(
            new S3GetObjectRequest({
                bucket: bucket,
                key: key,
            }),
        );
        return {
            key: s3GetObjectResponse.object.key,
            data: s3GetObjectResponse.object.data,
            mimetype: s3GetObjectResponse.object.mimetype,
            timestamp: s3GetObjectResponse.object.timestamp,
        };
    }

    /**
     * Uploads the provided file to the common pool
     * @param user Authenticated user
     * @param file The file to be uploaded
     * @returns Generated key for the file
     */
    async uploadToPool(
        user: AuthenticatedUser,
        file: Express.Multer.File,
    ): Promise<UploadObjectPayload> {
        return await this.upload(
            file,
            this.configService.get<string>(
                ConfigConstants.KEY_S3_POOL_BUCKET_NAME,
            ),
        );
    }

    /**
     * Uploads the provided file to the user's default bucket
     * @param user Authenticated user
     * @param file The file to be uploaded
     */
    async uploadToUserBucket(
        user: AuthenticatedUser,
        file: Express.Multer.File,
    ): Promise<UploadObjectPayload> {
        return await this.upload(file, user.bucket);
    }

    private async upload(
        file: Express.Multer.File,
        bucket: string,
    ): Promise<UploadObjectPayload> {
        const req: S3PutObjectRequest = new S3PutObjectRequest({
            file: file,
            key: this.getObjectKey(file.mimetype),
            bucket: bucket,
        });

        let s3Res: S3PutObjectResponse;
        try {
            s3Res = await this.s3Service.uploadToBucket(req);
            await ValidatorUtil.validate(s3Res);
        } catch (ex) {
            throw new ServiceStateException(ex);
        }

        return { key: s3Res.key, bucket: s3Res.bucket };
    }

    private getObjectKey(mimetype: string): string {
        const date: Date = new Date();
        const folder = `${date.getFullYear()}/${
            date.getMonth() + 1
        }/${date.getDate()}`;

        const filename =
            randomUUID().toString() + MimetypesUtil.getExtension(mimetype);

        return `${folder}/${filename}`;
    }
}
