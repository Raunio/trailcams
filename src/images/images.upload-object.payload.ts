import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UploadObjectPayload {
    @IsNotEmpty()
    @ApiProperty({ type: [String], description: 'Object key' })
    key: string;

    @IsNotEmpty()
    @ApiProperty({
        type: [String],
        description: 'Name of the bucket where the object was uploaded to',
    })
    bucket: string;
}
