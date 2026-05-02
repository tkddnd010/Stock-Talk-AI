import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { Cron, CronExpression, ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [ScheduleModule.forRoot()],
    providers: [StockService],
})
export class StockModule {
    constructor(private stockService: StockService){}

    // 10분 주기로 실행
    @Cron(CronExpression.EVERY_10_MINUTES)
    handleStockCron(){
        this.stockService.fetchStockPrice();
    }
}
