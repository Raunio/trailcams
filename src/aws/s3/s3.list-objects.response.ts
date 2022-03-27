import { IsNotEmpty } from 'class-validator';
import { S3ObjectDTO } from './s3.object.dto';

export class S3ListObjectsResponse {
    @IsNotEmpty()
    objects: S3ObjectDTO[];
}
