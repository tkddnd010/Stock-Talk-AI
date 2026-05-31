import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalysisService } from './analysis.service';

@ApiTags('분석 리포트')
@Controller('api/reports')
export class AnalysisController {
    constructor(private readonly analysisService: AnalysisService) {}

    @Get('history/:symbol')
    @ApiOperation({
        summary: '최신 AI 토론 대본 조회',
        description:
            '해당 종목의 가장 최근 종합 토론(DEBATE) 리포트 본문을 파싱하여, 화자·역할·대사 단위의 토론 스크립트 배열로 반환합니다. 토론 기록이 없으면 빈 배열을 반환합니다.',
    })
    @ApiParam({
        name: 'symbol',
        description:
            '조회할 주식 티커 심볼(예: AAPL, TSLA). 대소문자 구분 없이 처리되며 서버에서 대문자로 정규화됩니다.',
        example: 'AAPL',
    })
    @ApiResponse({
        status: 200,
        description:
            '토론 대본 스크립트 배열. 각 항목은 speaker(화자명), role(역할 코드), message(대사) 필드를 가집니다.',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    speaker: {
                        type: 'string',
                        description:
                            '발화자 이름(예: 가치투자자, 기술적분석가, 사회자)',
                        example: '가치투자자',
                    },
                    role: {
                        type: 'string',
                        description:
                            '프론트엔드 UI용 역할 코드. VALUE | TECH | MODERATOR | PANEL | SYSTEM',
                        example: 'VALUE',
                    },
                    message: {
                        type: 'string',
                        description: '해당 화자의 대사 본문',
                        example:
                            '현재 밸류에이션은 여전히 합리적인 수준입니다.',
                    },
                },
                required: ['speaker', 'role', 'message'],
            },
            example: [
                {
                    speaker: '가치투자자',
                    role: 'VALUE',
                    message: '장기 펀더멘털 관점에서 보면 매수 기회입니다.',
                },
                {
                    speaker: '기술적분석가',
                    role: 'TECH',
                    message: '단기적으로는 저항선 돌파 여부를 확인해야 합니다.',
                },
            ],
        },
    })
    async getDebateHistory(@Param('symbol') symbol: string) {
        return this.analysisService.getLatestDebateHistory(
            symbol.toUpperCase(),
        );
    }

    @Get(':symbol')
    @ApiOperation({
        summary: '종목별 분석 리포트 목록 조회',
        description:
            '해당 종목에 대해 저장된 모든 AI 분석 리포트(개별 성향 분석 INDIVIDUAL, 종합 토론 DEBATE)를 생성일 내림차순으로 반환합니다.',
    })
    @ApiParam({
        name: 'symbol',
        description:
            '조회할 주식 티커 심볼(예: AAPL, TSLA). 대소문자 구분 없이 처리되며 서버에서 대문자로 정규화됩니다.',
        example: 'TSLA',
    })
    @ApiResponse({
        status: 200,
        description:
            '분석 리포트 엔티티 배열. 리포트가 없으면 빈 배열을 반환합니다.',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'number',
                        description: '리포트 고유 ID',
                        example: 1,
                    },
                    symbol: {
                        type: 'string',
                        description: '분석 대상 종목 티커',
                        example: 'TSLA',
                    },
                    price: {
                        type: 'number',
                        description: '분석 당시 주가',
                        example: 245.5,
                    },
                    changePercent: {
                        type: 'number',
                        description: '분석 당시 주가 변동률(%)',
                        example: 2.35,
                    },
                    title: {
                        type: 'string',
                        description: '리포트 제목',
                        example: '[가치투자자 관점] TSLA 2.35% 변동 정밀 분석',
                    },
                    content: {
                        type: 'string',
                        description:
                            'AI가 생성한 리포트 본문(개별 분석 또는 토론 전문)',
                    },
                    author: {
                        type: 'string',
                        description:
                            '작성 주체(예: VALUE_BOT, DEBATE_MODERATOR_BOT)',
                        example: 'VALUE_BOT',
                    },
                    type: {
                        type: 'string',
                        enum: ['INDIVIDUAL', 'DEBATE'],
                        description:
                            'INDIVIDUAL: 성향별 개별 분석, DEBATE: 종합 토론',
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: '리포트 생성 시각(ISO 8601)',
                    },
                },
                required: [
                    'id',
                    'symbol',
                    'price',
                    'changePercent',
                    'title',
                    'content',
                    'author',
                    'type',
                    'createdAt',
                ],
            },
        },
    })
    async getReports(@Param('symbol') symbol: string) {
        return this.analysisService.getReportsBySymbol(symbol.toUpperCase());
    }
}
