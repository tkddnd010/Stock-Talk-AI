import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { Cron, CronExpression, ScheduleModule } from '@nestjs/schedule';
import { StockPrice } from './entities/stock-price.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisModule } from 'src/analysis/analysis.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([StockPrice]),
        AnalysisModule,
    ],
    providers: [StockService],
    exports: [StockService],
})
export class StockModule {}
