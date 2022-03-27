import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Point } from 'geojson';
import { AuthenticatedUser } from 'src/auth/authenticated.user';
import { ValidatorUtil } from 'src/util/validator.util';
import { Repository } from 'typeorm';
import { CameraDTO } from './camera.dto';
import { Camera } from './camera.entity';
import { RegisterCameraRequest } from './register-camera.request';
import { RegisterCameraPayload as RegisterCameraPayload } from './register-camera.payload';
import { CameraAlreadyExistsException } from './exception/camera-already-exists.exception';

@Injectable()
export class CamerasService {
    constructor(
        @InjectRepository(Camera)
        private readonly cameraRepository: Repository<Camera>,
    ) {}

    async registerCamera(
        user: AuthenticatedUser,
        request: RegisterCameraRequest,
    ): Promise<RegisterCameraPayload> {
        await ValidatorUtil.validate(request);

        const exsistingCamera = await this.cameraRepository.findOne({
            name: request.name,
            user_id: user.id,
        });

        if (exsistingCamera) {
            throw new CameraAlreadyExistsException(request.name);
        }

        const point: Point = {
            type: 'Point',
            coordinates: request.location.coordinates,
        };

        let createdCamera: Camera;

        try {
            createdCamera = await this.cameraRepository.save({
                name: request.name,
                location: point,
                user_id: user.id,
            });
        } catch (ex) {
            throw ex; // TODO
        }

        return {
            camera: {
                name: createdCamera.name,
                location: createdCamera.location,
                id: createdCamera.id,
            },
        };
    }

    async listCameras(user: AuthenticatedUser) {
        const cameras = await this.cameraRepository.find({ user_id: user.id });
        const cameraList: CameraDTO[] = cameras.map((cam) => {
            return { id: cam.id, location: cam.location, name: cam.name };
        });

        return cameraList;
    }
}
