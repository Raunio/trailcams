import { Injectable } from '@nestjs/common';
import { AuthException } from 'src/auth/exception/auth.exception';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthRequest } from './auth.request';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Login } from './login.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Login)
        private readonly repository: Repository<Login>,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(request: AuthRequest) {
        const login: Login = await this.repository.findOne({
            where: { name: request.username },
        });

        if (login && (await bcrypt.compare(request.password, login.password))) {
            const user = this.usersService.findOne(login.id);
            if (!user) {
                throw new AuthException(
                    'Matched credentials but no user is associated with them!',
                );
            }
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
