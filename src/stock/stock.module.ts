import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { Cron, CronExpression, ScheduleModule } from '@nestjs/schedule';
import { StockPrice } from './entities/stock-price.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([StockPrice]),
    ],
    providers: [StockService],
    exports: [StockService],
})
export class StockModule {}
