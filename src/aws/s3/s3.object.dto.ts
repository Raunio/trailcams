import { IsDateString, IsNotEmpty } from 'class-validator';

export class S3ObjectDTO {
    @IsNotEmpty()
    key: string;

    @IsNotEmpty()
    data: string;

    @IsNotEmpty()
    mimetype: string;

    @IsDateString()
    timestamp: string;
}
