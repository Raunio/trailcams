import { IsNotEmpty } from 'class-validator';
import { ServiceRequest } from 'src/service/service.request';

export class S3ListObjectsRequest extends ServiceRequest<S3ListObjectsRequest> {
    @IsNotEmpty()
    bucket: string;

    prefix: string;
}
