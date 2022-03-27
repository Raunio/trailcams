import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Camera } from './camera.entity';
import { CamerasService } from './cameras.service';

const mockRepository = () => {
    findOne: jest.fn();
};

describe('CamerasService', () => {
    let service: CamerasService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CamerasService,
                {
                    provide: getRepositoryToken(Camera),
                    useFactory: mockRepository,
                },
            ],
        }).compile();

        service = module.get<CamerasService>(CamerasService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
