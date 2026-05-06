import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { StockPrice } from './entities/stock-price.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class StockService {
    private readonly logger = new Logger(StockService.name);
    private readonly symbols: string[];

    constructor(
      private configService: ConfigService,
      @InjectRepository(StockPrice)
      private stockPriceRepository: Repository<StockPrice>,
    ) {
        // .env에서 종목 리스트를 가져와 배열로 변환합니다.
        this.symbols = this.configService.get<string>('MONITORING_STOCKS')!.split(',');
      }

      // 10분 주기로 실행
    @Cron(CronExpression.EVERY_10_MINUTES)
    async handleStockCron(){
        await this.fetchStockPrice();
    }

      // 실제 주가를 가져오는 핵심 함수
      async fetchStockPrice(){
        this.logger.log('주가 수집을 시작합니다....');

        for(const symbol of this.symbols){
          try{
            // 주가를 가져오는 로직 들어갈 자리(현재 임시 테스트를 위한 코드)
            const mockPrice = parseFloat((Math.random() * 100 + 100).toFixed(2));
            this.logger.debug(`[${symbol}] 현재가: $${mockPrice}`);

            // 여기에 디비에 저장하는 로직
            const newPrice = this.stockPriceRepository.create({
              symbol,
              price: mockPrice,
            });
            await this.stockPriceRepository.save(newPrice);
            this.logger.log(`${symbol} 데이터 수집 완료: $${mockPrice}`);
          }catch(error){
            this.logger.error(`${symbol} 데이터 수집 중 오류 발생:`,error.message);
          }
        }
      }
}
