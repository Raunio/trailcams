import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthException } from 'src/auth/exception/auth.exception';
import { UsersService } from 'src/users/users.service';
import { TestUtil } from 'src/util/test.util';
import { AuthService } from './auth.service';
import { IAMService } from 'src/aws/iam/iam.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Login } from './login.entity';

const mockUsersService = () => ({
    findOne: jest.fn(),
});

const mockJwtService = () => ({
    sign: jest.fn(),
});

const mockIamService = () => ({
    createSmptPassword: jest.fn(),
});

const mockLoginRepository = () => ({
    findOne: jest.fn(() => TestUtil.getInstance().getMockUserEntity().login),
});

describe('AuthService', () => {
    let service: AuthService;
    let usersService: UsersService;
    const repository = mockLoginRepository();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useFactory: mockUsersService,
                },
                {
                    provide: JwtService,
                    useFactory: mockJwtService,
                },
                {
                    provide: IAMService,
                    useFactory: mockIamService,
                },
                {
                    provide: getRepositoryToken(Login),
                    useValue: repository,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('Calls AuthService.login and rejects with AuthException when user is not found', () => {
        jest.spyOn(usersService, 'findOne').mockImplementation(() => null);

        expect(
            service.validateUser({
                username: TestUtil.getInstance().MOCK_USERNAME,
                password: TestUtil.getInstance().MOCK_USER_PASSWORD,
            }),
        ).rejects.toThrow(AuthException);
    });

    it('Calls AuthService.login and returns expected user', () => {
        const testUser = TestUtil.getInstance().getMockUserEntity();
        jest.spyOn(usersService, 'findOne').mockImplementation(() =>
            Promise.resolve(testUser),
        );

        expect(
            service.validateUser({
                username: TestUtil.getInstance().MOCK_USERNAME,
                password: TestUtil.getInstance().MOCK_USER_PASSWORD,
            }),
        ).resolves.toStrictEqual(testUser);
    });
});
