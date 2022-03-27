import { Injectable } from '@nestjs/common';
import { AuthException } from 'src/auth/exception/auth.exception';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthRequest } from './auth.request';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(request: AuthRequest) {
        const user: User = await this.usersService.findOne(request.username);

        if (user && (await bcrypt.compare(request.password, user.password))) {
            return user;
        } else {
            throw new AuthException('Invalid credentials');
        }
    }

    async login(user) {
        const payload = {
            username: user.name,
            sub: user.id,
            default_bucket: user.default_bucket,
            iam_username: user.iam_username,
        };

        return await this.jwtService.sign(payload, {
            expiresIn: '1h',
        });
    }
}
