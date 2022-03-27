import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { IAMService } from 'src/aws/iam/iam.service';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockUsersService = () => ({
    findOne: jest.fn(),
});

const mockJwtService = () => ({
    sign: jest.fn(),
});

const mockIamService = () => ({
    createSmtpPassword: jest.fn(),
});

describe('AuthController', () => {
    let controller: AuthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useFactory: mockUsersService },
                { provide: JwtService, useFactory: mockJwtService },
                { provide: IAMService, useFactory: mockIamService },
            ],
            controllers: [AuthController],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
