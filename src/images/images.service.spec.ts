import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { S3PutObjectResponse } from 'src/aws/s3/s3.put-object.response';
import { S3Service } from 'src/aws/s3/s3.service';
import { ServiceStateException } from 'src/exception/service.state.exception';
import { TestUtil } from 'src/util/test.util';
import { ImagesService } from './images.service';

const mockS3Service = () => ({
    uploadToBucket: jest.fn(),
});

const mockConfigService = () => ({
    get: jest.fn(),
});

describe('ImagesService', () => {
    let service: ImagesService;
    let s3Service: S3Service;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ImagesService,
                {
                    provide: S3Service,
                    useFactory: mockS3Service,
                },
                {
                    provide: ConfigService,
                    useFactory: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<ImagesService>(ImagesService);
        s3Service = module.get<S3Service>(S3Service);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('uploadToPool', () => {
        it('should throw BadServiceResponseException when S3Service response validation fails', () => {
            jest.spyOn(s3Service, 'uploadToBucket').mockImplementation(() =>
                Promise.resolve(new S3PutObjectResponse()),
            );

            expect(
                service.uploadToPool(
                    TestUtil.getInstance().getMockAuthenticatedUser(),
                    getMockFile(),
                ),
            ).rejects.toThrow(ServiceStateException);
        });

        it('should throw ServiceStateException when S3Service rejects', () => {
            jest.spyOn(s3Service, 'uploadToBucket').mockImplementation(() =>
                Promise.reject(new Error('Error')),
            );

            expect(
                service.uploadToPool(
                    TestUtil.getInstance().getMockAuthenticatedUser(),
                    getMockFile(),
                ),
            ).rejects.toThrow(ServiceStateException);
        });

        it('should return object key and bucket when uploadToPool is called', () => {
            jest.spyOn(s3Service, 'uploadToBucket').mockImplementation(() =>
                Promise.resolve({ key: 'key', bucket: 'bucket' }),
            );

            expect(
                service.uploadToPool(
                    TestUtil.getInstance().getMockAuthenticatedUser(),
                    getMockFile(),
                ),
            ).resolves.toStrictEqual({
                key: 'key',
                bucket: 'bucket',
            });
        });
    });
});

function getMockFile(): Express.Multer.File {
    return {
        fieldname: '',
        originalname: '',
        encoding: 'base64',
        mimetype: 'image/png',
        size: 16,
        stream: undefined,
        destination: '',
        filename: 'filename',
        path: 'path',
        buffer: Buffer.from([16]),
    };
}
