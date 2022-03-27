import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from 'src/auth/authenticated.user';

export const Auth = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user: AuthenticatedUser = {
            username: request.user.username,
            id: request.user.userId,
            bucket: request.user.default_bucket,
            iamUsername: request.user.iam_username,
        };

        return user;
    },
);
