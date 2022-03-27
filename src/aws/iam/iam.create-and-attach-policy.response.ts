import { IsNotEmpty } from 'class-validator';

export class CreateAndAttachPolicyResponse {
    @IsNotEmpty()
    policyArn: string;

    @IsNotEmpty()
    iamUsername: string;
}
