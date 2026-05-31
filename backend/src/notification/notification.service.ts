import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { parseDebateScript } from '../utils/debate-parser.util';

@Injectable()
export class NotificationService {
    constructor(private readonly notificationGateway: NotificationGateway) {}

    startLiveBroadcast(symbol: string, fullDebate: string) {
        // 💡 1. 스크린샷 양식에 맞춰 대본을 덩어리(Block)로 분석합니다.
        const parsedScript = parseDebateScript(fullDebate);

        console.log(
            `[방송국] ${symbol} 방 생중계 준비 완료! 총 ${parsedScript.length}개의 대화 턴 송출 시작.`,
        );

        // 💡 2. 묶여진 덩어리를 3초 간격으로 프론트엔드에 쏩니다.
        parsedScript.forEach((block, index) => {
            setTimeout(() => {
                this.notificationGateway.broadcastToRoom(
                    symbol,
                    'debate_message',
                    {
                        speaker: block.speaker, // 예: "가치투자자(반박)"
                        role: block.role, // 예: "VALUE" (프론트 색상용)
                        message: block.message, // 예: "부분 실현은 이해하지만..."
                        timestamp: new Date(),
                    },
                );

                // 터미널에서 송출되는 내용 미리보기
                console.log(`[송출 중] ${block.speaker}: ${block.message}`);
            }, index * 3000); // 3초 간격
        });
    }
}
