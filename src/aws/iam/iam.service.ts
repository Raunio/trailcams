import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigConstants } from 'src/constants/config.constants';
import {
    IAMClient,
    CreateUserCommand,
    CreateUserCommandOutput,
    AttachUserPolicyCommand,
    AttachUserPolicyCommandOutput,
    ListAccessKeysCommand,
    ListAccessKeysCommandOutput,
    CreateAccessKeyCommand,
    CreateAccessKeyCommandOutput,
    CreatePolicyCommand,
    CreatePolicyCommandOutput,
} from '@aws-sdk/client-iam';
import { IAMCreateCredentialsResponse as IAMCreateCredentialsResponse } from './iam.create-credentials.response';
import { createHmac } from 'crypto';
import { IAMCreateUserResponse } from './iam.create-user.response';
import { InvalidParameterException } from 'src/exception/invalid.parameter.exception';
import { BadServiceResponseException } from 'src/exception/bad.service.response';
import { ServiceStateException } from 'src/exception/service.state.exception';
import { UserHasAccessKeyException } from './exception/user-has-access-key.exception';
import * as utf8 from 'utf8';
import { CreateAndAttachPolicyRequest } from './iam.create-and-attach-policy.request';
import { ValidatorUtil } from 'src/util/validator.util';
import { CreateAndAttachPolicyResponse } from './iam.create-and-attach-policy.response';
import { StringUtil } from 'src/util/string.util';

@Injectable()
export class IAMService {
    private readonly client: IAMClient;
    private readonly algorithm: string = 'sha256';

    private readonly defaultRegion: string;

    constructor(private readonly configService: ConfigService) {
        this.defaultRegion = this.configService.get<string>(
            ConfigConstants.KEY_DEFAULT_AWS_REGION,
        );

        this.client = new IAMClient({
            region: this.defaultRegion,
        });
    }

    /**
     * Creates an IAM user for authenticated user
     * @param user Authenticated user
     * @returns Created IAM user
     */
    async createIamUser(username: string): Promise<IAMCreateUserResponse> {
        if (!username) {
            throw new InvalidParameterException(
                'Parameter username is mandatory',
            );
        }
        const createUserCommand = new CreateUserCommand({
            UserName: `trailcams-iam-user-${username}-${StringUtil.randomString(
                5,
            )}`,
            PermissionsBoundary: this.configService.get<string>(
                ConfigConstants.KEY_IAM_USER_POLICY_TEMPLATE_ARN,
            ),
        });
        let createUserOutput: CreateUserCommandOutput;

        try {
            createUserOutput = await this.client.send(createUserCommand);
        } catch (ex) {
            throw new ServiceStateException(ex);
        }

        if (!createUserOutput || !createUserOutput.User) {
            throw new BadServiceResponseException(
                `Got invalid response from IAM while trying to create user: ${createUserOutput}`,
            );
        }

        return { username: createUserOutput.User.UserName };
    }

    async createAndAttachPolicy(
        request: CreateAndAttachPolicyRequest,
    ): Promise<CreateAndAttachPolicyResponse> {
        await ValidatorUtil.validate(request);

        const createPolicyCommand: CreatePolicyCommand =
            new CreatePolicyCommand({
                PolicyName: request.iamUserName + '--user-policy',
                PolicyDocument: JSON.stringify({
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Effect: 'Allow',
                            Action: [
                                's3:PutObject',
                                's3:GetObject',
                                'ses:SendRawEmail',
                                's3:ListBucket',
                            ],
                            Resource: [
                                `arn:aws:s3:::${request.s3BucketName}`,
                                `arn:aws:s3:::${request.s3BucketName}`,
                                `arn:aws:s3:::${request.s3BucketName}--thumbnails`,
                                `arn:aws:s3:::${request.s3BucketName}--thumbnails/*`,
                                this.configService.get<string>(
                                    ConfigConstants.KEY_SES_IDENTITY_NAME,
                                ),
                            ],
                        },
                    ],
                }),
            });

        let createPolicyOutput: CreatePolicyCommandOutput;
        try {
            createPolicyOutput = await this.client.send(createPolicyCommand);
        } catch (ex) {
            throw new ServiceStateException(ex);
        }

        if (
            !createPolicyOutput ||
            !createPolicyOutput.Policy ||
            !createPolicyOutput.Policy.Arn
        ) {
            throw new BadServiceResponseException(
                `Got invalid response from IAM while trying to create policy: ${createPolicyOutput}`,
            );
        }

        const attachPolicyCommand = new AttachUserPolicyCommand({
            PolicyArn: createPolicyOutput.Policy.Arn,
            UserName: request.iamUserName,
        });

        let attachPolicyOutput: AttachUserPolicyCommandOutput;

        try {
            attachPolicyOutput = await this.client.send(attachPolicyCommand);
        } catch (ex) {
            throw new ServiceStateException(ex);
        }

        // might as well chech that there is something
        if (!attachPolicyOutput || !attachPolicyOutput.$metadata) {
            throw new BadServiceResponseException(
                `Got invalid response from IAM while trying to attach user policy. 
                Response or response metadata is undefined, 
                which could mean that the policy was not correctly attached.`,
            );
        }

        return {
            policyArn: createPolicyOutput.Policy.Arn,
            iamUsername: request.iamUserName,
        };
    }

    /**
     * Creates access key and calculates a SMTP password from it.
     * @param iamUser IAM User
     * @returns AccessKeyId and Calculated SMPT password based on created access key
     */
    async createSmtpCredentials(
        iamUsername: string,
    ): Promise<IAMCreateCredentialsResponse> {
        if (!iamUsername) {
            throw new InvalidParameterException(
                'Parameter iamUsername is mandatory',
            );
        }

        const listAccessKeysCommand = new ListAccessKeysCommand({
            UserName: iamUsername,
        });

        let accessKeyListOutput: ListAccessKeysCommandOutput;
        try {
            accessKeyListOutput = await this.client.send(listAccessKeysCommand);
        } catch (ex) {
            throw new ServiceStateException(ex);
        }

        // Do not allow creation of new Access keys when user already has one
        if (
            accessKeyListOutput.AccessKeyMetadata &&
            accessKeyListOutput.AccessKeyMetadata.length > 0
        ) {
            throw new UserHasAccessKeyException(iamUsername);
        }

        const createAccessKeyCommand = new CreateAccessKeyCommand({
            UserName: iamUsername,
        });

        let createAccessKeyOutput: CreateAccessKeyCommandOutput;
        try {
            createAccessKeyOutput = await this.client.send(
                createAccessKeyCommand,
            );
        } catch (ex) {
            throw new ServiceStateException(ex);
        }

        if (
            !createAccessKeyOutput ||
            !createAccessKeyOutput.AccessKey ||
            !createAccessKeyOutput.AccessKey.AccessKeyId ||
            !createAccessKeyOutput.AccessKey.SecretAccessKey
        ) {
            throw new BadServiceResponseException(
                `Got invalid response from IAM while trying to create access key: ${createAccessKeyOutput}`,
            );
        }

        const secretAccessKey: string =
            createAccessKeyOutput.AccessKey.SecretAccessKey;

        return {
            accessKeyId: createAccessKeyOutput.AccessKey.AccessKeyId,
            smtpPassword: this.calculateKey(secretAccessKey),
        };
    }

    private calculateKey(secretAccessKey: string): string {
        const date = '11111111';
        const service = 'ses';
        const terminal = 'aws4_request';
        const message = 'SendRawEmail';
        const version = 0x04;

        let signature = this.sign(utf8.encode(`AWS4${secretAccessKey}`), date);
        signature = this.sign(
            signature,
            this.configService.get<string>(
                ConfigConstants.KEY_DEFAULT_AWS_REGION,
            ),
        );
        signature = this.sign(signature, service);
        signature = this.sign(signature, terminal);
        signature = this.sign(signature, message);

        const signatureAndVersion = Buffer.concat([
            Buffer.from([version]),
            signature,
        ]);

        return utf8.encode(signatureAndVersion.toString('base64'));
    }

    private sign(key, msg) {
        return createHmac(this.algorithm, key).update(msg, 'utf8').digest();
    }
}
