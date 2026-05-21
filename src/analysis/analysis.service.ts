import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { InvestorType } from './enums/investor-type.enum';
import { PERSONA_PROMPTS } from './constants/persona-prompt.constant';

@Injectable()
export class AnalysisService {
    private readonly logger = new Logger(AnalysisService.name);

    constructor(private readonly aiService: AiService){}

    // 주가 변동 시 stock 서비스가 이 함수를 호출하여 토론을 위임함.
    async runMultiAgentDebate(symbol: string, currentPrice: number, changePercent: number){
        this.logger.log(`[AI 토론 시작]: ${symbol} 종목 분석을 시작합니다.`);

        const allPersona = Object.values(InvestorType);

        for(const persona of allPersona){
            const selectedPrompt = PERSONA_PROMPTS[persona];
            const result = await this.aiService.getAnalysis(selectedPrompt, symbol, changePercent, currentPrice);

            this.logger.log(`[${persona} 에이전트 의견]: ${result}`);
        }
    }
}
