import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class StockService {
    private readonly logger = new Logger(StockService.name);
    private readonly symbols: string[];

    constructor(private configService: ConfigService) {
        // .env에서 종목 리스트를 가져와 배열로 변환합니다.
        this.symbols = this.configService.get<string>('MONITORING_STOCKS')!.split(',');
      }

      // 실제 주가를 가져오는 핵심 함수
      async fetchStockPrice(){
        this.logger.log('주가 수집을 시작합니다....');

        for(const symbol of this.symbols){
          try{
            // 주가를 가져오는 로직 들어갈 자리(현재 임시 테스트를 위한 코드)
            const mockPrice = (Math.random() * 100 + 100).toFixed(2);

            this.logger.debug(`[${symbol}] 현재가: $${mockPrice}`);

            // 여기에 디비에 저장하는 로직
          }catch(error){
            this.logger.error(`${symbol} 데이터 수집 중 오류 발생:`,error.message);
          }
        }
      }
}
