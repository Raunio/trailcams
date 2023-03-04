import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3Service } from 'src/aws/s3/s3.service';
import { Repository } from 'typeorm';
import { CreateUserRequest } from './create-user.request';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { AuthConstants } from 'src/constants/auth.constants';
import { UserAlreadyExistsException } from 'src/exception/user-already-exists.exception';
import { S3CreateBucketResponse } from 'src/aws/s3/s3.create-bucket.response';
import { CreateUserPayload } from './create-user.payload';
import { IAMService } from 'src/aws/iam/iam.service';
import { ValidatorUtil } from 'src/util/validator.util';
import { BadServiceResponseException } from 'src/exception/bad.service.response';
import { S3Constants } from 'src/aws/s3/s3.constants';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly s3Service: S3Service,
        private readonly iamService: IAMService,
    ) {}

    async findOne(username: string): Promise<User | undefined> {
        return this.usersRepository.findOne({ where: { name: username } });
    }

    /**
     * Creates a user and a S3 bucket for the user.
     * @param createUserRequest Request object containing username and password
     * @returns Created user
     */
    async createUser(
        createUserRequest: CreateUserRequest,
    ): Promise<CreateUserPayload> {
        const existingUser = await this.findOne(createUserRequest.username);
        if (existingUser) {
            throw new UserAlreadyExistsException(createUserRequest.username);
        }
        const bucketName = `${S3Constants.USER_BUCKET_PREFIX}${createUserRequest.username}`;

        // Create bucket
        const createBucketRes: S3CreateBucketResponse =
            await this.s3Service.createBucket(bucketName);

        if (!createBucketRes || !createBucketRes.bucketName) {
            throw new BadServiceResponseException(
                `Invalid create bucket response: \n${createBucketRes}`,
            );
        }

        // Create thumbnails bucket
        const createThumbnailsBucketRes: S3CreateBucketResponse =
            await this.s3Service.createBucket(
                bucketName + S3Constants.THUMBNAILS.BUCKET_POSTFIX,
            );

        if (
            !createThumbnailsBucketRes ||
            !createThumbnailsBucketRes.bucketName
        ) {
            throw new BadServiceResponseException(
                `Invalid create bucket response: \n${createBucketRes}`,
            );
        }

        // Put notification configuration
        await this.s3Service.putNotificationConfiguration(bucketName);

        // Create IAM user
        const createIamUserRes = await this.iamService.createIamUser(
            createUserRequest.username,
        );

        await ValidatorUtil.validate(createIamUserRes);

        // Create IAM user policy
        await this.iamService.createAndAttachPolicy({
            s3BucketName: createBucketRes.bucketName,
            iamUserName: createIamUserRes.username,
            username: createUserRequest.username,
        });

        const hashedPassword = bcrypt.hashSync(
            createUserRequest.password,
            AuthConstants.BCRYPT_DEFAULT_ROUNDS,
        );

        const user = {
            name: createUserRequest.username,
            password: hashedPassword,
            default_bucket: createBucketRes.bucketName,
            iam_username: createIamUserRes.username,
        };

        // Create user
        const createdUser = await this.usersRepository.save(user);

        return {
            username: createdUser.name,
            default_bucket: createdUser.default_bucket,
        };
    }
}
