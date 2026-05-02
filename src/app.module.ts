import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { StockModule } from './stock/stock.module';
import { AnalysisModule } from './analysis/analysis.module';
import { NotificationModule } from './notification/notification.module';

@Module({
    imports: [StockModule, AnalysisModule, NotificationModule,ConfigModule.forRoot({
        isGlobal: true,
    })],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
