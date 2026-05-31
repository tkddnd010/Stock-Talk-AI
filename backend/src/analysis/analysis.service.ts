import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { InvestorType } from './enums/investor-type.enum';
import { PERSONA_PROMPTS } from './constants/persona-prompt.constant';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalysisReport } from './entities/analysis-report.entity';
import { Repository } from 'typeorm';
import { NotificationService } from '../notification/notification.service';
import { parseDebateScript } from '../utils/debate-parser.util';

@Injectable()
export class AnalysisService {
    private readonly logger = new Logger(AnalysisService.name);

    constructor(
        private readonly aiService: AiService,
        private readonly notificationService: NotificationService,
        @InjectRepository(AnalysisReport)
        private readonly analysisRepository: Repository<AnalysisReport>,
    ) {}

    // 주가 변동 시 stock 서비스가 이 함수를 호출하여 토론을 위임함.
    async runMultiAgentDebate(
        symbol: string,
        currentPrice: number,
        changePercent: number,
    ) {
        this.logger.log(`[AI 토론 시작]: ${symbol} 종목 분석을 시작합니다.`);

        const collectedAnalyses = await this.publishIndividualAnalyses(
            symbol,
            currentPrice,
            changePercent,
        );

        await this.conductComprehensiveDebate(
            symbol,
            currentPrice,
            changePercent,
            collectedAnalyses,
        );
    }

    private async publishIndividualAnalyses(
        symbol: string,
        currentPrice: number,
        changePercent: number,
    ) {
        const allPersona = Object.values(InvestorType);
        const collected = {};

        for (const persona of allPersona) {
            try {
                const prompt = PERSONA_PROMPTS[persona];
                const result = await this.aiService.getAnalysis(
                    prompt,
                    symbol,
                    changePercent,
                    currentPrice,
                );

                collected[persona] = result;

                this.logger.log(`${persona} 성향의 의견: ${result}`);

                await this.analysisRepository.save({
                    symbol,
                    price: currentPrice,
                    changePercent,
                    title: `[${persona} 관점] ${symbol} ${changePercent.toFixed(2)}% 변동 정밀 분석`,
                    content: result,
                    author: `${persona}_BOT`,
                    type: 'INDIVIDUAL',
                });

                this.logger.log(`${persona} 분석글 저장 완료`);
            } catch (error) {
                this.logger.error(
                    `${persona} 분석글 저장 중 오류 발생: ${error.message}`,
                );
            }
        }
        return collected;
    }

    private async conductComprehensiveDebate(
        symbol: string,
        currentPrice: number,
        changePercent: number,
        analyses: any,
    ) {
        this.logger.log(`[종합 토론 시작] ${symbol} 종목의 토론을 시작합니다.`);

        const debatePrompt = `
        다음은 ${symbol} 주가 변동에 대한 전문가 의견입니다.
        - 가치투자자: ${analyses[InvestorType.VALUE] || '의견 없음'}
        - 기술적분석가: ${analyses[InvestorType.TECHNICAL] || '의견 없음'}

        이 의견들을 바탕으로 서로 반박하고 옹호하는 치열한 토론 대본을 작성하세요.
        `;

        try {
            const debateResult = await this.aiService.getAnalysis(
                '당신은 금융 토론을 매끄럽게 진행하고 조율하는 전문 모더레이터 AI입니다.',
                symbol,
                changePercent,
                currentPrice,
                debatePrompt,
            );

            this.logger.log(`[종합토론 내용]: ${debateResult}`);

            await this.analysisRepository.save({
                symbol,
                price: currentPrice,
                changePercent,
                title: `[종합 토론] ${symbol} 변동성 감지에 따른 AI 투자 의견 토론`,
                content: debateResult,
                author: 'DEBATE_MODERATOR_BOT',
                type: 'DEBATE',
            });

            this.notificationService.startLiveBroadcast(symbol, debateResult);

            this.logger.log(`[종합 토론] 대본 저장 완료`);
        } catch (error) {
            this.logger.error(`[종합 토론 실패]: ${error.message}`);
        }
    }

    async getReportsBySymbol(symbol: string) {
        return this.analysisRepository.find({
            where: { symbol },
            order: { createdAt: 'DESC' },
        });
    }

    async getLatestDebateHistory(symbol: string) {
        const latestDebate = await this.analysisRepository.findOne({
            where: { symbol, type: 'DEBATE' },
            order: { createdAt: 'DESC' },
        });

        if (!latestDebate) return [];

        return parseDebateScript(latestDebate.content);
    }
}
