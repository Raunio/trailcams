import { IsNotEmptyObject } from 'class-validator';
import { S3ObjectDTO } from './s3.object.dto';

export class S3GetObjectResponse {
    @IsNotEmptyObject()
    object: S3ObjectDTO;
}
