import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from 'src/aws/s3/s3.service';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

const mockS3Service = () => {
    uploadToPool: jest.fn();
};

const mockConfigService = () => {
    get: jest.fn();
};

describe('ImagesController', () => {
    let controller: ImagesController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ImagesController],
            providers: [
                ImagesService,
                { provide: S3Service, useFactory: mockS3Service },
                { provide: ConfigService, useFactory: mockConfigService },
            ],
        }).compile();

        controller = module.get<ImagesController>(ImagesController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
