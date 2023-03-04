import {
    CreateBucketCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    PutBucketNotificationConfigurationCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@aws-sdk/util-stream-node';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Service } from 'src/aws/s3/s3.service';
import { BadServiceResponseException } from 'src/exception/bad.service.response';
import { InvalidParameterException } from 'src/exception/invalid.parameter.exception';
import { ServiceStateException } from 'src/exception/service.state.exception';
import { ValidationException } from 'src/exception/validation.exception';
import { TestUtil } from 'src/util/test.util';
import { Readable } from 'typeorm/platform/PlatformTools';
import { ObjectNotFoundException } from './exception/object.not-found.exception';
import { S3GetObjectRequest } from './s3.get-object.request';
import { S3ListObjectsRequest } from './s3.list-objects.request';
import { S3PutObjectRequest } from './s3.put-object.request';

const mockConfigService = () => ({
    get: jest.fn(),
});

describe('S3Service', () => {
    let service: S3Service;
    const mockS3 = mockClient(S3Client);

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                S3Service,
                { provide: ConfigService, useFactory: mockConfigService },
                { provide: S3Client, useValue: mockS3 },
            ],
        }).compile();

        service = module.get<S3Service>(S3Service);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createBucket', () => {
        it('should throw error when createBucket is called but bucketName is not provided', () => {
            expect(service.createBucket(null)).rejects.toThrow(
                InvalidParameterException,
            );
        });

        it('should throw ServiceStateException when createBucket is called but S3 rejects', () => {
            mockS3.on(CreateBucketCommand).rejects();

            expect(
                service.createBucket(
                    TestUtil.getInstance().MOCK_DEFAULT_BUCKET_NAME,
                ),
            ).rejects.toThrow(ServiceStateException);
        });

        it('should throw BadServiceResponseException when createBucket is called but S3/createBucket returns invalid data', () => {
            mockS3.on(CreateBucketCommand).resolves(undefined);

            expect(
                service.createBucket(
                    TestUtil.getInstance().MOCK_DEFAULT_BUCKET_NAME,
                ),
            ).rejects.toThrow(BadServiceResponseException);
        });

        it('should return correct bucket name when createBucket is called', () => {
            mockS3.on(CreateBucketCommand).resolves({ Location: 'location' });
            mockS3.on(PutBucketNotificationConfigurationCommand).resolves;
            expect(
                service.createBucket(
                    TestUtil.getInstance().MOCK_DEFAULT_BUCKET_NAME,
                ),
            ).resolves.toStrictEqual({
                bucketName: TestUtil.getInstance().MOCK_DEFAULT_BUCKET_NAME,
            });
        });

        it('should throw ServiceStateException putNotificationConfiguration is called but S3 rejects', () => {
            mockS3.on(PutBucketNotificationConfigurationCommand).rejects();

            expect(
                service.putNotificationConfiguration(
                    TestUtil.getInstance().MOCK_DEFAULT_BUCKET_NAME,
                ),
            ).rejects.toThrow(ServiceStateException);
        });
    });

    describe('uploadToBucket', () => {
        it('should reject when S3PutRequest is missing properties', () => {
            expect(
                service.uploadToBucket(new S3PutObjectRequest()),
            ).rejects.toThrow(ValidationException);
        });

        it('should throw ServiceStateException when S3 rejects', () => {
            mockS3.on(PutObjectCommand).rejects();

            expect(service.uploadToBucket(mockS3PutRequest())).rejects.toThrow(
                ServiceStateException,
            );
        });

        it('should throw BadServiceResponseException when S3 resolves but returns invalid data', () => {
            mockS3.on(PutObjectCommand).resolves(undefined);

            expect(service.uploadToBucket(mockS3PutRequest())).rejects.toThrow(
                BadServiceResponseException,
            );
        });

        it('should return correct key and bucket when uploadToBucket is called', () => {
            const req: S3PutObjectRequest = mockS3PutRequest();
            mockS3.on(PutObjectCommand).resolves({ $metadata: undefined });

            expect(service.uploadToBucket(req)).resolves.toStrictEqual({
                bucket: req.bucket,
                key: req.key,
            });
        });
    });

    describe('listObjects', () => {
        it('should throw ValidationException when request object is not provided', () => {
            expect(service.listObjects(undefined)).rejects.toThrow(
                ValidationException,
            );
        });

        it('should throw ValidationException when bucket name is not provided', () => {
            expect(
                service.listObjects(
                    new S3ListObjectsRequest({
                        bucket: undefined,
                        prefix: 'a',
                    }),
                ),
            ).rejects.toThrow(ValidationException);
        });

        it('should throw ServiceStateException when S3 rejects', () => {
            mockS3.on(ListObjectsV2Command).rejects();
            expect(service.listObjects(mockS3ListRequest())).rejects.toThrow(
                ServiceStateException,
            );
        });

        it('should throw BadServiceResponseException when S3 list objects returns invalid data', () => {
            mockS3.on(ListObjectsV2Command).resolves(undefined);
            expect(service.listObjects(mockS3ListRequest())).rejects.toThrow(
                BadServiceResponseException,
            );
        });

        it('should return expected array of strings when listObjects is called', () => {
            const date = new Date();
            mockS3.on(ListObjectsV2Command).resolves({
                Contents: [
                    { Key: 'a', LastModified: date },
                    { Key: 'b', LastModified: date },
                ],
            });

            expect(
                service.listObjects(mockS3ListRequest()),
            ).resolves.toStrictEqual({
                objects: [
                    { key: 'a', timestamp: date.toISOString() },
                    { key: 'b', timestamp: date.toISOString() },
                ],
            });
        });
    });

    describe('getObject', () => {
        it('should throw ValidationException when request is missing object key', () => {
            expect(
                service.getObject(
                    new S3GetObjectRequest({
                        bucket: TestUtil.getInstance().MOCK_DEFAULT_BUCKET_NAME,
                    }),
                ),
            ).rejects.toThrow(ValidationException);
        });

        it('should throw ObjectNotFoundException when S3 rejects with NoSuchKey', () => {
            mockS3.on(GetObjectCommand).rejects({ name: 'NoSuchKey' });
            expect(
                service.getObject({
                    key: 'a',
                    bucket: TestUtil.getInstance().MOCK_DEFAULT_BUCKET_NAME,
                }),
            ).rejects.toThrow(ObjectNotFoundException);
        });

        it('should throw ServiceStateException when S3 rejects with any other error', () => {
            mockS3.on(GetObjectCommand).rejects();
            expect(
                service.getObject({
                    key: 'a',
                    bucket: TestUtil.getInstance().MOCK_DEFAULT_BUCKET_NAME,
                }),
            ).rejects.toThrow(ServiceStateException);
        });

        it('should throw BadServiceResponseException when S3 returns invalid data', () => {
            mockS3.on(GetObjectCommand).resolves(undefined);
            expect(
                service.getObject(
                    new S3GetObjectRequest({
                        key: 'a',
                        bucket: TestUtil.getInstance().MOCK_DEFAULT_BUCKET_NAME,
                    }),
                ),
            ).rejects.toThrow(BadServiceResponseException);
        });

        it('should return expected key and base64 encoded content when getObject is called', () => {
            mockS3.on(GetObjectCommand).resolves({
                Body: sdkStreamMixin(Readable.from([Buffer.from([1])])),
                ContentType: 'image/png',
            });

            expect(
                service.getObject(
                    new S3GetObjectRequest({
                        key: 'a',
                        bucket: TestUtil.getInstance().MOCK_DEFAULT_BUCKET_NAME,
                    }),
                ),
            ).resolves.toStrictEqual({
                object: {
                    key: 'a',
                    data: Buffer.from([1]).toString('base64'),
                    mimetype: 'image/png',
                    timestamp: undefined,
                },
            });
        });
    });
});

function mockS3PutRequest(): S3PutObjectRequest {
    return {
        key: 'key',
        bucket: TestUtil.getInstance().MOCK_DEFAULT_BUCKET_NAME,
        file: {
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
        },
    };
}

function mockS3ListRequest() {
    return {
        bucket: TestUtil.getInstance().MOCK_DEFAULT_BUCKET_NAME,
        prefix: null,
    };
}
