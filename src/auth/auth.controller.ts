import { Response, Request } from 'express';
import {
    Body,
    Controller,
    Get,
    Post,
    Put,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
} from '@nestjs/swagger';
import { IAMService } from 'src/aws/iam/iam.service';
import { Auth } from 'src/decorators/auth.decorator';
import { TrailApiResponse } from 'src/domain/trail.api.response';
import { CreateUserRequest } from 'src/users/create-user.request';
import { CreateUserPayload } from 'src/users/create-user.payload';
import { UsersService } from 'src/users/users.service';
import { AuthRequest } from './auth.request';
import { AuthService } from './auth.service';
import { AuthenticatedUser } from './authenticated.user';
import { CreateCredentialsPayload } from './create-credentials.payload';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly iamService: IAMService,
    ) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ApiOperation({ description: 'Creates and signs an access token' })
    @ApiBody({ type: [AuthRequest] })
    @ApiOkResponse({ type: [String], description: 'Signed Bearer token' })
    @ApiBadRequestResponse({
        type: [TrailApiResponse],
        description:
            'Http status 400 when either username or password is incorrect',
    })
    async login(@Req() req: Request, @Res() res: Response) {
        const token = await this.authService.login(req.user);
        res.cookie('access-token', token, {
            httpOnly: true,
            domain: 'localhost',
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        }).send(new TrailApiResponse(undefined));
    }

    @Put('register')
    @ApiOperation({
        description: 'Creates a new user with the provided credentials.',
    })
    @ApiBody({ type: [AuthRequest] })
    @ApiOkResponse({ type: [CreateUserPayload] })
    @ApiBadRequestResponse({
        type: [CreateUserPayload],
        description: `Bad Request. Response statusCode can have the following values:\n1 - USERNAME_ALREADY_EXISTS`,
    })
    async register(@Body() request: CreateUserRequest) {
        return new TrailApiResponse<CreateUserPayload>(
            await this.usersService.createUser(request),
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('smtp-credentials')
    @ApiBearerAuth()
    @ApiOperation({
        description: 'Creates and returns smtp credentials for the user.',
    })
    @ApiOkResponse({ type: [CreateCredentialsPayload] })
    @ApiForbiddenResponse({
        type: [TrailApiResponse],
        description:
            'Http status 403 with statusCode 3 when the user already has smpt credentials',
    })
    async createSmtpCredentials(@Auth() user: AuthenticatedUser) {
        return new TrailApiResponse<CreateCredentialsPayload>(
            CreateCredentialsPayload.from(
                await this.iamService.createSmtpCredentials(user.iamUsername),
            ),
        );
    }
}
