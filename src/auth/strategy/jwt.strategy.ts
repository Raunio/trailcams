import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { AuthConstants } from 'src/constants/auth.constants';

export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: (req) => {
                if (!req || !req.cookies) {
                    return null;
                }

                return req.cookies['access-token'];
            },
            ignoreExpiration: false,
            secretOrKey: AuthConstants.JWT_SECRET,
        });
    }

    async validate(payload: any) {
        return {
            userId: payload.sub,
            username: payload.username,
            default_bucket: payload.default_bucket,
            iam_username: payload.iam_username,
        };
    }
}
