import { ApiProperty } from '@nestjs/swagger';
import { CameraDTO } from './camera.dto';

export class ListCamerasPayload {
    @ApiProperty({ description: 'An array of cameras' })
    cameras: CameraDTO[];
}
