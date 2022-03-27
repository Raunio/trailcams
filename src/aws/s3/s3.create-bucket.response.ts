import { IsNotEmpty } from 'class-validator';

export class S3CreateBucketResponse {
    constructor(bucketName) {
        this.bucketName = bucketName;
    }
    @IsNotEmpty()
    bucketName: string;
}
