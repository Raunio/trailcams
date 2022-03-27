import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyObject } from 'class-validator';
import { CameraDTO } from './camera.dto';

export class RegisterCameraPayload {
    @ApiProperty({ description: 'The newly created camera.' })
    @IsNotEmptyObject()
    camera: CameraDTO;
}
