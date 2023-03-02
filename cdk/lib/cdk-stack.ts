import * as cdk from 'aws-cdk-lib';
import {
    Effect,
    ManagedPolicy,
    Policy,
    PolicyStatement,
    User,
} from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class TrailcamsAPICdkStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const iamUserPermissionBoundaryTemplate = new ManagedPolicy(
            this,
            'trailcams-permission-boundary-template',
            {
                statements: [
                    new PolicyStatement({
                        effect: Effect.ALLOW,
                        actions: ['ses:SendRawEmail'],
                        resources: ['*'],
                    }),
                ],
            },
        );
    }
}
