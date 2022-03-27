import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNotEmptyObject } from 'class-validator';
import { Point } from 'geojson';

export class RegisterCameraRequest {
    @ApiProperty({ description: 'Name of the camera.' })
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Location of the camera.' })
    @IsNotEmptyObject()
    location: Point;
}
