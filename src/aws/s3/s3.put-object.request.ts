import { IsNotEmpty, IsNotEmptyObject } from 'class-validator';
import { ServiceRequest } from 'src/service/service.request';

export class S3PutObjectRequest extends ServiceRequest<S3PutObjectRequest> {
    @IsNotEmptyObject()
    file: Express.Multer.File;

    @IsNotEmpty()
    key: string;

    @IsNotEmpty()
    bucket: string;
}
