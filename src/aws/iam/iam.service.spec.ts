import { Test, TestingModule } from '@nestjs/testing';
import { IAMService } from 'src/aws/iam/iam.service';
import { ConfigService } from '@nestjs/config';
import { InvalidParameterException } from 'src/exception/invalid.parameter.exception';
import { TestUtil } from 'src/util/test.util';
import { BadServiceResponseException } from 'src/exception/bad.service.response';
import { mockClient } from 'aws-sdk-client-mock';
import {
    IAMClient,
    CreateUserCommand,
    CreateUserCommandOutput,
    AttachUserPolicyCommand,
    AttachUserPolicyCommandOutput,
    ListAccessKeysCommand,
    ListAccessKeysCommandOutput,
    CreateAccessKeyCommand,
    CreateAccessKeyCommandOutput,
    CreatePolicyCommand,
} from '@aws-sdk/client-iam';
import { ServiceStateException } from 'src/exception/service.state.exception';
import { UserHasAccessKeyException } from './exception/user-has-access-key.exception';
import { ValidationException } from 'src/exception/validation.exception';
import { CreateAndAttachPolicyRequest } from './iam.create-and-attach-policy.request';

const mockConfigService = () => ({
    get: jest.fn(),
});

describe('IAMService', () => {
    let service: IAMService;
    const mockIAM = mockClient(IAMClient);
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IAMService,
                {
                    provide: ConfigService,
                    useFactory: mockConfigService,
                },
                {
                    provide: IAMClient,
                    useValue: mockIAM,
                },
            ],
        }).compile();

        service = module.get<IAMService>(IAMService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createIamUser', () => {
        it('throws InvalidParameterException when createIamUser is called and username is not provided', () => {
            expect(service.createIamUser(undefined)).rejects.toThrow(
                InvalidParameterException,
            );
        });

        it('throws ServiceStateException when createIamUser is called and IAM rejects', () => {
            mockIAM.on(CreateUserCommand).rejects();

            expect(
                service.createIamUser(TestUtil.getInstance().MOCK_IAM_USERNAME),
            ).rejects.toThrow(ServiceStateException);
        });

        it('throws BadServiceResponseException when createIamUser is called and IAM returns invalid response', () => {
            // First: IAM client returns undefined CreteaUserCommandOutput
            mockIAM.on(CreateUserCommand).resolves(undefined);

            expect(
                service.createIamUser(TestUtil.getInstance().MOCK_IAM_USERNAME),
            ).rejects.toThrow(BadServiceResponseException);

            // Second: IAM client resturns CreateUserCommandOutput with undefined user
            mockIAM.on(CreateUserCommand).resolves({ User: undefined });

            expect(
                service.createIamUser(TestUtil.getInstance().MOCK_IAM_USERNAME),
            ).rejects.toThrow(BadServiceResponseException);
        });

        it('returns IAM username when createIamUser is called', () => {
            mockIAM
                .on(CreateUserCommand)
                .resolves(mockCreateUserCommandOutput());
            mockIAM
                .on(AttachUserPolicyCommand)
                .resolves(mockAttachUserPolicyOutput());

            expect(
                service.createIamUser(TestUtil.getInstance().MOCK_IAM_USERNAME),
            ).resolves.toStrictEqual({
                username: TestUtil.getInstance().MOCK_IAM_USERNAME,
            });
        });
    });

    describe('createAndAttachPolicy', () => {
        it('should throw ValidationException when provided request object has undefined properties', () => {
            expect(service.createAndAttachPolicy(undefined)).rejects.toThrow(
                ValidationException,
            );

            const req = new CreateAndAttachPolicyRequest();
            expect(service.createAndAttachPolicy(req)).rejects.toThrow(
                ValidationException,
            );
        });

        it('should throw ServiceStateException when createPolicy rejects', () => {
            mockIAM.on(CreatePolicyCommand).rejects();

            expect(
                service.createAndAttachPolicy({
                    iamUserName: TestUtil.getInstance().MOCK_IAM_USERNAME,
                    s3BucketName:
                        TestUtil.getInstance().MOCK_DEFAULT_BUCKET_NAME,
                }),
            ).rejects.toThrow(ServiceStateException);
        });

        it('should throw BadServiceResponseException when createPolicy response is invalid', () => {
            mockIAM.on(CreatePolicyCommand).resolves(undefined);

            expect(
                service.createAndAttachPolicy({
                    iamUserName: TestUtil.getInstance().MOCK_IAM_USERNAME,
                    s3BucketName:
                        TestUtil.getInstance().MOCK_DEFAULT_BUCKET_NAME,
                }),
            ).rejects.toThrow(BadServiceResponseException);
        });

        it('should throw ServiceStateException when attachPolicy rejects', () => {
            mockIAM.on(CreatePolicyCommand).resolves(mockCreatePolicyOutput());
            mockIAM.on(AttachUserPolicyCommand).rejects();

            expect(
                service.createAndAttachPolicy({
                    iamUserName: TestUtil.getInstance().MOCK_IAM_USERNAME,
                    s3BucketName:
                        TestUtil.getInstance().MOCK_DEFAULT_BUCKET_NAME,
                }),
            ).rejects.toThrow(ServiceStateException);
        });

        it('should throw BadServiceResponseException when attachPolicy response has no metadata', () => {
            mockIAM.on(CreatePolicyCommand).resolves(mockCreatePolicyOutput());
            mockIAM.on(AttachUserPolicyCommand).resolves(undefined);

            expect(
                service.createAndAttachPolicy({
                    iamUserName: TestUtil.getInstance().MOCK_IAM_USERNAME,
                    s3BucketName:
                        TestUtil.getInstance().MOCK_DEFAULT_BUCKET_NAME,
                }),
            ).rejects.toThrow(BadServiceResponseException);
        });

        it('should happily resolve when all of the services return valid data', () => {
            mockIAM.on(CreatePolicyCommand).resolves(mockCreatePolicyOutput());
            mockIAM.on(AttachUserPolicyCommand).resolves({ $metadata: {} });

            expect(
                service.createAndAttachPolicy({
                    iamUserName: TestUtil.getInstance().MOCK_IAM_USERNAME,
                    s3BucketName:
                        TestUtil.getInstance().MOCK_DEFAULT_BUCKET_NAME,
                }),
            ).resolves.toStrictEqual({
                policyArn: 'arn',
                iamUsername: TestUtil.getInstance().MOCK_IAM_USERNAME,
            });
        });
    });

    describe('createCredentials', () => {
        it('should throw InvalidParameterException when iamUsername is not provided', () => {
            expect(service.createSmtpCredentials(undefined)).rejects.toThrow(
                InvalidParameterException,
            );
        });

        it('should throw ServiceStateException when list access keys rejects', () => {
            mockIAM.on(ListAccessKeysCommand).rejects();

            expect(
                service.createSmtpCredentials(
                    TestUtil.getInstance().MOCK_IAM_USERNAME,
                ),
            ).rejects.toThrow(ServiceStateException);
        });

        it('should throw UserHasAccessKeyException when list access keys returns access key metadata', () => {
            mockIAM
                .on(ListAccessKeysCommand)
                .resolves(mockListAccessKeysOutput());

            expect(
                service.createSmtpCredentials(
                    TestUtil.getInstance().MOCK_IAM_USERNAME,
                ),
            ).rejects.toThrow(UserHasAccessKeyException);
        });

        it('should throw ServiceStateException when create access key rejects', () => {
            mockIAM
                .on(ListAccessKeysCommand)
                .resolves({ AccessKeyMetadata: undefined });

            mockIAM.on(CreateAccessKeyCommand).rejects();

            expect(
                service.createSmtpCredentials(
                    TestUtil.getInstance().MOCK_IAM_USERNAME,
                ),
            ).rejects.toThrow(ServiceStateException);
        });

        it('should throw BadServiceResponseException when create access key returns invalid output', () => {
            mockIAM
                .on(ListAccessKeysCommand)
                .resolves({ AccessKeyMetadata: undefined });
            mockIAM
                .on(CreateAccessKeyCommand)
                .resolves({ $metadata: undefined, AccessKey: undefined });

            expect(
                service.createSmtpCredentials(
                    TestUtil.getInstance().MOCK_IAM_USERNAME,
                ),
            ).rejects.toThrow(BadServiceResponseException);
        });

        it('should calculate smpt password from created user access key', () => {
            mockIAM
                .on(ListAccessKeysCommand)
                .resolves({ AccessKeyMetadata: undefined });
            mockIAM
                .on(CreateAccessKeyCommand)
                .resolves(mockCreateAccessKeyOutput());

            jest.spyOn(configService, 'get').mockImplementation(
                () => 'eu-west-1',
            );

            expect(
                service.createSmtpCredentials(
                    TestUtil.getInstance().MOCK_IAM_USERNAME,
                ),
            ).resolves.toStrictEqual({
                accessKeyId: 'accessKeyId',
                smtpPassword: 'BItmIlYeVN+BrKD43Wdu7uWGPGOSrZP7KSEO1qYpWaJ+',
            });
        });
    });
});

function mockCreateUserCommandOutput(): CreateUserCommandOutput {
    return {
        $metadata: undefined,
        User: {
            UserId: 'userId',
            UserName: TestUtil.getInstance().MOCK_IAM_USERNAME,
            Path: '/path',
            Arn: ':arn:',
            CreateDate: new Date(),
        },
    };
}

function mockAttachUserPolicyOutput(): AttachUserPolicyCommandOutput {
    return {
        $metadata: {
            attempts: 1,
            requestId: 'requestId',
        },
    };
}

function mockCreatePolicyOutput() {
    return {
        Policy: {
            Arn: 'arn',
        },
    };
}

function mockListAccessKeysOutput(): ListAccessKeysCommandOutput {
    return {
        $metadata: undefined,
        AccessKeyMetadata: [
            { UserName: TestUtil.getInstance().MOCK_IAM_USERNAME },
        ],
    };
}

function mockCreateAccessKeyOutput(): CreateAccessKeyCommandOutput {
    return {
        $metadata: undefined,
        AccessKey: {
            AccessKeyId: 'accessKeyId',
            SecretAccessKey: 'secretAccessKey',
            UserName: TestUtil.getInstance().MOCK_IAM_USERNAME,
            Status: 'status',
        },
    };
}
