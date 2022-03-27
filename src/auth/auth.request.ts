import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AuthRequest {
    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }

    @IsNotEmpty()
    @ApiProperty({ type: String })
    username: string;

    @IsNotEmpty()
    @ApiProperty({ type: String })
    password: string;
}
