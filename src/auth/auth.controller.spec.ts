import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { IAMService } from 'src/aws/iam/iam.service';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Login } from './login.entity';

const mockUsersService = () => ({
    findOne: jest.fn(),
});

const mockJwtService = () => ({
    sign: jest.fn(),
});

const mockIamService = () => ({
    createSmtpPassword: jest.fn(),
});

const mockLoginRepository = () => ({
    findOne: jest.fn(),
});

describe('AuthController', () => {
    let controller: AuthController;
    const repository = mockLoginRepository();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useFactory: mockUsersService },
                { provide: JwtService, useFactory: mockJwtService },
                { provide: IAMService, useFactory: mockIamService },
                { provide: getRepositoryToken(Login), useValue: repository },
            ],
            controllers: [AuthController],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
