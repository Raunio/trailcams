import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserAlreadyExistsException } from 'src/exception/user-already-exists.exception';
import { S3CreateBucketResponse } from 'src/aws/s3/s3.create-bucket.response';
import { S3Service } from 'src/aws/s3/s3.service';
import { TestUtil } from 'src/util/test.util';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { IAMService } from 'src/aws/iam/iam.service';
import { IAMCreateUserResponse } from 'src/aws/iam/iam.create-user.response';
import { Login } from 'src/auth/login.entity';

const mockS3Service = () => ({
    createBucket: jest.fn(
        () =>
            new S3CreateBucketResponse(
                TestUtil.getInstance().MOCK_DEFAULT_BUCKET_NAME,
            ),
    ),
    putNotificationConfiguration: jest.fn(),
});

const mockUsersRepository = () => ({
    findOne: jest.fn(() => TestUtil.getInstance().getMockUserEntity()),
    save: jest.fn(() => TestUtil.getInstance().getMockUserEntity()),
});

const mockIAMService = () => ({
    createIamUser: jest.fn(),
    createAndAttachPolicy: jest.fn(),
});

const mockLoginRepository = () => ({
    findOne: jest.fn(),
    create: jest.fn(() => TestUtil.getInstance().getMockUserEntity().login),
});

describe('UsersService', () => {
    let service: UsersService;
    let s3Service: S3Service;
    let iamService: IAMService;
    const repository = mockUsersRepository();
    const loginRepository = mockLoginRepository();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: repository,
                },
                {
                    provide: S3Service,
                    useFactory: mockS3Service,
                },
                {
                    provide: IAMService,
                    useFactory: mockIAMService,
                },
                {
                    provide: getRepositoryToken(Login),
                    useValue: loginRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        s3Service = module.get<S3Service>(S3Service);
        iamService = module.get<IAMService>(IAMService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return a single user', () => {
        expect(
            service.findOne(TestUtil.getInstance().MOCK_USERNAME),
        ).resolves.toStrictEqual(TestUtil.getInstance().getMockUserEntity());
    });

    it('should throw UserAlreadyExistsException when createUser is called and repository.findOne returns user', () => {
        jest.spyOn(repository, 'findOne').mockImplementation(() => new User());
        expect(
            service.createUser({
                username: TestUtil.getInstance().MOCK_USERNAME,
                password: TestUtil.getInstance().MOCK_USER_PASSWORD,
            }),
        ).rejects.toThrow(UserAlreadyExistsException);
    });

    it('should call UserRepository.save, create S3 bucket and return created user when createUser is called', () => {
        jest.spyOn(repository, 'findOne').mockImplementation(() => undefined);
        const mockIAMUser: IAMCreateUserResponse = {
            username: TestUtil.getInstance().MOCK_IAM_USERNAME,
        };
        jest.spyOn(iamService, 'createIamUser').mockImplementation(() =>
            Promise.resolve(mockIAMUser),
        );

        return expect(
            service.createUser({
                username: TestUtil.getInstance().MOCK_USERNAME,
                password: TestUtil.getInstance().MOCK_USER_PASSWORD,
            }),
        )
            .resolves.toStrictEqual({
                username: TestUtil.getInstance().MOCK_USERNAME,
                default_bucket: TestUtil.getInstance().MOCK_DEFAULT_BUCKET_NAME,
            })
            .then(() => {
                expect(repository.save).toHaveBeenCalled();
                expect(s3Service.createBucket).toHaveBeenCalled();
                expect(iamService.createIamUser).toHaveBeenCalled();
                expect(iamService.createAndAttachPolicy).toHaveBeenCalled();
            });
    });
});
