import { IsNotEmpty } from 'class-validator';

export class IAMCreateUserResponse {
    @IsNotEmpty()
    username: string;
}
