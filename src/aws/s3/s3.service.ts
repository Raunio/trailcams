import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigConstants } from 'src/constants/config.constants';
import {
    S3Client,
    PutObjectCommand,
    PutObjectCommandOutput,
    CreateBucketCommand,
    CreateBucketCommandOutput,
    ListObjectsV2Command,
    ListObjectsV2Output,
    GetObjectCommand,
    GetObjectOutput,
    PutObjectCommandInput,
    PutBucketNotificationConfigurationCommand,
} from '@aws-sdk/client-s3';
import { BadServiceResponseException } from 'src/exception/bad.service.response';
import { S3CreateBucketResponse } from './s3.create-bucket.response';
import { S3PutObjectRequest } from './s3.put-object.request';
import { S3PutObjectResponse } from './s3.put-object.response';
import { ServiceStateException } from 'src/exception/service.state.exception';
import { InvalidParameterException } from 'src/exception/invalid.parameter.exception';
import { ValidatorUtil } from 'src/util/validator.util';
import { S3ListObjectsResponse } from './s3.list-objects.response';
import { S3GetObjectRequest } from './s3.get-object.request';
import { S3GetObjectResponse } from './s3.get-object.response';
import { Readable } from 'node:stream';
import { ObjectNotFoundException } from './exception/object.not-found.exception';
import { S3ListObjectsRequest } from './s3.list-objects.request';

/**
 * Service class for S3 operations such as GET, PUT, LIST, etc ...
 */
@Injectable()
export class S3Service {
    private readonly logger: Logger = new Logger(S3Service.name);
    private readonly client: S3Client;

    constructor(private readonly configService: ConfigService) {
        const defaultRegion = this.configService.get<string>(
            ConfigConstants.KEY_DEFAULT_AWS_REGION,
        );

        this.client = new S3Client({
            region: defaultRegion,
        });

        this.logger.debug(
            `Initialized S3Service with default region ${defaultRegion}`,
        );
    }

    async uploadToBucket(
        request: S3PutObjectRequest,
    ): Promise<S3PutObjectResponse> {
        await ValidatorUtil.validate(request);

        const params: PutObjectCommandInput = {
            Bucket: request.bucket,
            Key: request.key,
            Body: request.file.buffer,
            ContentType: request.file.mimetype,
            ContentDisposition: 'inline',
            Metadata: {
                timestamp: new Date().toISOString(),
            },
        };

        const putObjectCommand = new PutObjectCommand(params);

        let putObjectOutput: PutObjectCommandOutput;
        try {
            putObjectOutput = await this.client.send(putObjectCommand);
        } catch (ex) {
            throw new ServiceStateException(ex);
        }

        if (!putObjectOutput) {
            throw new BadServiceResponseException(
                `Got invalid response from S3 while putting object: ${putObjectOutput}`,
            );
        }

        return {
            key: request.key,
            bucket: request.bucket,
        };
    }

    async createBucket(bucketName: string): Promise<S3CreateBucketResponse> {
        if (!bucketName) {
            throw new InvalidParameterException(
                `Parameter 'bucketName' is mandatory`,
            );
        }

        let createBucketOutput: CreateBucketCommandOutput;

        try {
            createBucketOutput = await this.client.send(
                new CreateBucketCommand({
                    Bucket: bucketName,
                }),
            );
        } catch (ex) {
            throw new ServiceStateException(ex);
        }

        if (!createBucketOutput || !createBucketOutput.Location) {
            throw new BadServiceResponseException(
                `Got invalid response from S3: ${createBucketOutput}`,
            );
        }

        return {
            bucketName: bucketName,
        };
    }

    async putNotificationConfiguration(bucketName: string) {
        const putNotificationConfigurationCommand =
            new PutBucketNotificationConfigurationCommand({
                Bucket: bucketName,
                NotificationConfiguration: {
                    LambdaFunctionConfigurations: [
                        {
                            LambdaFunctionArn: this.configService.get<string>(
                                ConfigConstants.KEY_THUMBNAIL_LAMBDA_FUNCTION_ARN,
                            ),
                            Events: ['s3:ObjectCreated:Put'],
                        },
                    ],
                },
            });

        try {
            await this.client.send(putNotificationConfigurationCommand);
        } catch (ex) {
            throw new ServiceStateException(ex);
        }
    }

    async listObjects(
        request: S3ListObjectsRequest,
    ): Promise<S3ListObjectsResponse> {
        await ValidatorUtil.validate(request);

        const listObjectsCommand: ListObjectsV2Command =
            new ListObjectsV2Command({
                Bucket: request.bucket,
                Prefix: request.prefix,
            });

        let listObjectsOutput: ListObjectsV2Output;
        try {
            listObjectsOutput = await this.client.send(listObjectsCommand);
        } catch (ex) {
            throw new ServiceStateException(ex);
        }

        if (!listObjectsOutput) {
            throw new BadServiceResponseException(
                'ListObjectsOutput from S3 is undefined or empty.',
            );
        }

        const objects = [];
        listObjectsOutput.Contents?.forEach((obj) =>
            objects.push({
                key: obj.Key,
                timestamp: obj.LastModified?.toISOString(),
            }),
        );

        return {
            objects,
        };
    }

    async getObject(request: S3GetObjectRequest): Promise<S3GetObjectResponse> {
        await ValidatorUtil.validate(request);

        const getObjectCommand: GetObjectCommand = new GetObjectCommand({
            Key: request.key,
            Bucket: request.bucket,
        });

        let getObjectOutput: GetObjectOutput;
        try {
            getObjectOutput = await this.client.send(getObjectCommand);
        } catch (ex) {
            if (ex.name === 'NoSuchKey') {
                throw new ObjectNotFoundException(request.key, request.bucket);
            }

            throw new ServiceStateException(ex);
        }

        if (!getObjectOutput || !getObjectOutput.Body) {
            throw new BadServiceResponseException(
                `Got invalid response from S3 while getting object with key '${request.key}' from bucket '${request.bucket}':\n ${getObjectOutput}`,
            );
        }

        return {
            object: {
                key: request.key,
                data: await this.streamToString(
                    getObjectOutput.Body as Readable,
                ),
                mimetype: getObjectOutput.ContentType,
                timestamp:
                    getObjectOutput.Metadata.timestamp ||
                    getObjectOutput.LastModified.toISOString(),
            },
        };
    }

    private async streamToString(stream: Readable): Promise<string> {
        return await new Promise((resolve, reject) => {
            const chunks: Uint8Array[] = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () =>
                resolve(Buffer.concat(chunks).toString('base64')),
            );
        });
    }
}
