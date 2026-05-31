import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: true,
        credentials: true,
    });

    const swaggerConfig = new DocumentBuilder()
        .setTitle('AI 주식 토론 생중계 API')
        .setDescription('AI 투자 성향별 분석 리포트 및 종합 토론 대본 API')
        .setVersion('1.0')
        .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: '로그인 API에서 발급받은 access_token을 입력하세요.',
        })
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api-docs', app, document);

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
