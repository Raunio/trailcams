import { randomUUID } from 'crypto';
import { User } from 'src/users/user.entity';
import * as bcrypt from 'bcrypt';
import { AuthConstants } from 'src/constants/auth.constants';
import { AuthenticatedUser } from 'src/auth/authenticated.user';

export class TestUtil {
    public readonly MOCK_USERNAME: string;
    public readonly MOCK_USER_ID: string;
    public readonly MOCK_USER_PASSWORD: string;
    public readonly MOCK_USER_PASSWORD_HASHED: string;
    public readonly MOCK_DEFAULT_BUCKET_NAME: string;
    public readonly MOCK_IAM_USERNAME: string;

    private constructor() {
        this.MOCK_USERNAME = randomUUID().toString();
        this.MOCK_USER_ID = randomUUID().toString();
        this.MOCK_USER_PASSWORD = randomUUID().toString();
        this.MOCK_USER_PASSWORD_HASHED = bcrypt.hashSync(
            this.MOCK_USER_PASSWORD,
            AuthConstants.BCRYPT_DEFAULT_ROUNDS,
        );
        this.MOCK_DEFAULT_BUCKET_NAME = randomUUID().toString();
        this.MOCK_IAM_USERNAME = randomUUID().toString();
    }

    private static instance: TestUtil;
    static getInstance(): TestUtil {
        if (!this.instance) {
            this.instance = new TestUtil();
        }

        return this.instance;
    }

    /**
     * @returns A user with arbitrary values
     */
    getMockUserEntity(): User {
        return {
            id: this.MOCK_USER_ID,
            name: this.MOCK_USERNAME,
            password: this.MOCK_USER_PASSWORD_HASHED,
            default_bucket: this.MOCK_DEFAULT_BUCKET_NAME,
            iam_username: this.MOCK_IAM_USERNAME,
        };
    }

    getMockAuthenticatedUser(): AuthenticatedUser {
        return {
            id: this.MOCK_USER_ID,
            username: this.MOCK_USERNAME,
            bucket: this.MOCK_DEFAULT_BUCKET_NAME,
            iamUsername: this.MOCK_IAM_USERNAME,
        };
    }
}
