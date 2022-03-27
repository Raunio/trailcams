import { IsNotEmpty } from 'class-validator';

export class S3PutObjectResponse {
    @IsNotEmpty()
    key: string;

    @IsNotEmpty()
    bucket: string;
}
