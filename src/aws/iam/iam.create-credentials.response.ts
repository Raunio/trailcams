import { IsNotEmpty } from 'class-validator';

export class IAMCreateCredentialsResponse {
    @IsNotEmpty()
    accessKeyId: string;
    @IsNotEmpty()
    smtpPassword: string;
}
