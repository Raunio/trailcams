import { IsNotEmpty } from 'class-validator';
import { ServiceRequest } from 'src/service/service.request';

export class S3GetObjectRequest extends ServiceRequest<S3GetObjectRequest> {
    @IsNotEmpty()
    key: string;

    @IsNotEmpty()
    bucket: string;
}
