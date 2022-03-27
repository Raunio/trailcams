import { IsNotEmpty } from 'class-validator';

export class CreateAndAttachPolicyRequest {
    @IsNotEmpty()
    iamUserName: string;
    @IsNotEmpty()
    s3BucketName: string;
}
