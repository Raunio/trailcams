import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmptyObject, IsNumber } from 'class-validator';

export class TrailApiResponse<T> {
    constructor(data: T) {
        this.payload = data;
    }

    @ApiPropertyOptional({
        description: 'Payload object containing the actual response data',
    })
    payload?: T;

    @IsNumber()
    @ApiPropertyOptional({
        type: [Number],
        description: `Optional response property that describes detailed information 
        about the response for situations where the http status code alone isn't sufficient.`,
    })
    statusCode?: number;

    @ApiPropertyOptional({
        type: [String],
        description: `Optional response property that describes information about the response in text format.`,
    })
    message?: string | Record<any, string>;

    @IsDateString()
    @ApiPropertyOptional({
        type: [Date],
        description: `Optional server response timestamp`,
    })
    timestamp?: string;
}
