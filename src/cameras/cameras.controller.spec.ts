import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Camera } from './camera.entity';
import { CamerasController } from './cameras.controller';
import { CamerasService } from './cameras.service';

const mockRepository = () => {
    findOne: jest.fn();
};

describe('CamerasController', () => {
    let controller: CamerasController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CamerasController],
            providers: [
                CamerasService,
                {
                    provide: getRepositoryToken(Camera),
                    useFactory: mockRepository,
                },
            ],
        }).compile();

        controller = module.get<CamerasController>(CamerasController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
