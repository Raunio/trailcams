import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { IAMService } from 'src/aws/iam/iam.service';
import { AuthConstants } from 'src/constants/auth.constants';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { Login } from './login.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
            secret: AuthConstants.JWT_SECRET,
            signOptions: { expiresIn: '120s' },
        }),
        TypeOrmModule.forFeature([Login]),
    ],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy, IAMService],
})
export class AuthModule {}
