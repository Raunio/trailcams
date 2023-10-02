import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from './images/images.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { HealthController } from './health/health.controller';
import { RequestIdMiddleware } from './middleware/request-id.middleware';
import { CamerasModule } from './cameras/cameras.module';
import { User } from './users/user.entity';
import { Camera } from './cameras/camera.entity';
import { UserGroup } from './users/user.group.entity';
import { Login } from './auth/login.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'user',
            password: 'pass',
            database: 'trailcams',
            entities: [User, Camera, Login, UserGroup],
            synchronize: true,
        }),
        ImagesModule,
        AuthModule,
        UsersModule,
        CamerasModule,
    ],
    controllers: [HealthController],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestIdMiddleware).forRoutes('*');
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
