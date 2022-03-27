import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthenticatedUser } from 'src/auth/authenticated.user';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Auth } from 'src/decorators/auth.decorator';
import { TrailApiResponse } from 'src/domain/trail.api.response';
import { CameraDTO } from './camera.dto';
import { CamerasService } from './cameras.service';
import { RegisterCameraRequest } from './register-camera.request';
import { RegisterCameraPayload } from './register-camera.payload';

@Controller('cameras')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CamerasController {
    constructor(private readonly camerasService: CamerasService) {}

    @ApiOperation({ description: 'Registers a new camera for the user.' })
    @Put('register')
    async registerCamera(
        @Auth() user: AuthenticatedUser,
        @Body() request: RegisterCameraRequest,
    ) {
        return new TrailApiResponse<RegisterCameraPayload>(
            await this.camerasService.registerCamera(user, request),
        );
    }

    @ApiOperation({ description: 'Lists all of the users registered cameras ' })
    @Get('list')
    async listCameras(@Auth() user: AuthenticatedUser) {
        return new TrailApiResponse<CameraDTO[]>(
            await this.camerasService.listCameras(user),
        );
    }
}
