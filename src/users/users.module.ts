import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IAMService } from 'src/aws/iam/iam.service';
import { S3Service } from 'src/aws/s3/s3.service';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { Login } from 'src/auth/login.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([Login]),
    ],
    providers: [UsersService, S3Service, IAMService],
    exports: [UsersService],
})
export class UsersModule {}
