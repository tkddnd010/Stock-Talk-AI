import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StockModule } from './stock/stock.module';
import { AnalysisModule } from './analysis/analysis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from './notification/notification.module';

@Module({
    imports: [StockModule, AnalysisModule, NotificationModule,
        ConfigModule.forRoot({isGlobal: true,}),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USERNAME'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_DATABASE'),
                autoLoadEntities: true, // 엔티티 자동 로드
                synchronize: true, // 데이터베이스 동기화(개발 환경에서만 사용)
                dropSchema: true, // 서버가 재시작될 때마다 기존 테이블을 삭제하고 새로 만듭니다.
            }),

        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
