import { IsNotEmpty } from 'class-validator';

export class AuthenticatedUser {
    @IsNotEmpty()
    id: string;

    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    bucket: string;

    @IsNotEmpty()
    iamUsername: string;
}
