import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IAMCreateCredentialsResponse } from 'src/aws/iam/iam.create-credentials.response';

export class CreateCredentialsPayload {
    @IsNotEmpty()
    @ApiProperty({ type: [String], description: 'SMTP username' })
    smptUser: string;

    @IsNotEmpty()
    @ApiProperty({ type: [String], description: 'SMTP password' })
    smptPassword: string;

    static from(
        iamCreateCredentialsResponse: IAMCreateCredentialsResponse,
    ): CreateCredentialsPayload {
        return {
            smptUser: iamCreateCredentialsResponse.accessKeyId,
            smptPassword: iamCreateCredentialsResponse.smtpPassword,
        };
    }
}
