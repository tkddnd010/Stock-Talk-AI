import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { StockPrice } from './entities/stock-price.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import YahooFinance from 'yahoo-finance2';

@Injectable()
export class StockService implements OnModuleInit {
    private readonly logger = new Logger(StockService.name);
    private readonly symbols: string[];

    private readonly yahooFinance = new YahooFinance();

    constructor(
      private configService: ConfigService,
      @InjectRepository(StockPrice)
      private stockPriceRepository: Repository<StockPrice>,
    ) {
        // .env에서 종목 리스트를 가져와 배열로 변환합니다.
        this.symbols = this.configService.get<string>('MONITORING_STOCKS')!.split(',');
      }
      async onModuleInit() {
        this.logger.log('🚀 주식 모니터링 서비스가 성공적으로 초기화되었습니다.');
      }

      // 10분 주기로 실행
    @Cron(CronExpression.EVERY_10_MINUTES)
    async handleStockCron(){
        await this.fetchStockPrice();
    }

      // 실제 주가를 가져오는 핵심 함수
      async fetchStockPrice(){
        for(const symbol of this.symbols){
          try{
            // 주가를 가져오는 로직 들어갈 자리(현재 임시 테스트를 위한 코드)
            const quote = await this.yahooFinance.quote(symbol);
            const currentPrice = (quote as any).regularMarketPrice;

            if (!currentPrice) {
              this.logger.warn(`${symbol} 가격을 가져오지 못했습니다.`);
              continue; // 여기 continue 부분 고민해 볼것
            }

            // 주가 변동률 계산하는 로직
            const lastRecord = await this.stockPriceRepository.findOne({
              where: {symbol},
              order: {createdAt: 'DESC'},
            })

            if(lastRecord){
              const lastPrice = Number(lastRecord.price);
              const changePercent = ((currentPrice-lastPrice) / lastPrice) * 100;

              const logMsg = `[${symbol}] 현재: $${currentPrice.toFixed(2)} (${changePercent.toFixed(2)}%)`;

              // 변동률이 4프로 이상이면 AI 토론 자율 생성 로직 들어갈 자리
              if(Math.abs(changePercent) >= 4){
                this.logger.warn(`${symbol} ${(Math.abs(changePercent)).toFixed(2)}% 변동 감지`);
              }else{
                this.logger.log(logMsg);
              }
            }

            // 여기에 디비에 저장하는 로직
            const newPrice = this.stockPriceRepository.create({
              symbol,
              price: currentPrice,
            });

            await this.stockPriceRepository.save(newPrice);
          }catch(error){
            this.logger.error(`${symbol} 데이터 수집 중 오류 발생:`,error.message);
          }
        }
      }
}
