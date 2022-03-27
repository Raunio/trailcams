import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNotEmptyObject } from 'class-validator';
import { Point } from 'geojson';

export class CameraDTO {
    @ApiProperty({ description: 'The unique identifier of the camera.' })
    @IsNotEmpty()
    id: string;

    @ApiProperty({ description: 'The name of the camera.' })
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'The gps coordinates of the camera.' })
    @IsNotEmptyObject()
    location: Point;
}
