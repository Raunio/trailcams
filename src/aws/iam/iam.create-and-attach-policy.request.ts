import { IsNotEmpty } from 'class-validator';

export class CreateAndAttachPolicyRequest {
    @IsNotEmpty()
    username: string;
    @IsNotEmpty()
    iamUserName: string;
    @IsNotEmpty()
    s3BucketName: string;
}
