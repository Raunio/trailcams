import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IAMService } from 'src/aws/iam/iam.service';
import { S3Service } from 'src/aws/s3/s3.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UsersService, S3Service, IAMService],
    exports: [UsersService],
})
export class UsersModule {}
