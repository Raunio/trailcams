import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TrailExceptionFilfter } from './exception/filter/trail.exception.filter';
import { GenericExceptionFilter } from './exception/filter/generic.exception.filter';
import { HttpExceptionFilter } from './exception/http.exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(
        new GenericExceptionFilter(),
        new HttpExceptionFilter(),
        new TrailExceptionFilfter(),
    );
    app.enableCors({ credentials: true, origin: 'http://localhost:3000' });
    app.use(cookieParser());

    const config = new DocumentBuilder()
        .setTitle('Trailcams API')
        .setDescription('The trailcams API description')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(3000);
}
bootstrap();
