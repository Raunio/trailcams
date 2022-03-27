import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateUserPayload {
    @IsNotEmpty()
    @ApiProperty({ type: [String], description: 'Username' })
    username: string;
    @IsNotEmpty()
    @ApiProperty({ type: [String], description: 'Default bucket name' })
    default_bucket: string;
}
