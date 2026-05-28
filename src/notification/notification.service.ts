import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationGateway: NotificationGateway) {}

  startLiveBroadcast(symbol: string, fullDebate: string) {
    // 💡 1. 스크린샷 양식에 맞춰 대본을 덩어리(Block)로 분석합니다.
    const parsedScript = this.parseDebateScript(fullDebate);

    console.log(`[방송국] ${symbol} 방 생중계 준비 완료! 총 ${parsedScript.length}개의 대화 턴 송출 시작.`);

    // 💡 2. 묶여진 덩어리를 3초 간격으로 프론트엔드에 쏩니다.
    parsedScript.forEach((block, index) => {
      setTimeout(() => {
        this.notificationGateway.broadcastToRoom(symbol, 'debate_message', {
          speaker: block.speaker, // 예: "가치투자자(반박)"
          role: block.role,       // 예: "VALUE" (프론트 색상용)
          message: block.message, // 예: "부분 실현은 이해하지만..."
          timestamp: new Date(),
        });
        
        // 터미널에서 송출되는 내용 미리보기
        console.log(`[송출 중] ${block.speaker}: ${block.message}`);
      }, index * 3000); // 3초 간격
    });
  }

  // ✂️ 스크린샷 맞춤형 텍스트 분해기
  // ✂️ 스크린샷 맞춤형 초강력 텍스트 분해기
  private parseDebateScript(fullDebate: string): Array<{ speaker: string, role: string, message: string }> {
    const lines = fullDebate.split('\n');
    const scriptBlocks: { speaker: string; role: string; message: string }[] = [];

    let currentSpeaker = '시스템';
    let currentRole = 'SYSTEM';
    let currentMessage: string[] = [];

    const flushBlock = () => {
      if (currentMessage.length > 0) {
        scriptBlocks.push({
          speaker: currentSpeaker,
          role: currentRole,
          message: currentMessage.join(' ').trim()
        });
        currentMessage = [];
      }
    };

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      // 💡 핵심 정규식: "이름:" 뒤에 대사가 있든 없든 다 잡아냅니다.
      // 괄호, 한글, 영문, 공백이 포함된 이름(예: "크로스 질문(사회자)") 매칭
      const speakerMatch = line.match(/^([가-힣A-Za-z\s\(\)·]+):\s*(.*)$/);
      // 대괄호로 묶인 특수 헤더 잡아내기 (예: "[가치투자자 - 요약]")
      const bracketMatch = line.match(/^\[(.*?)\]$/);

      if (speakerMatch && !line.match(/^[0-9]+:/)) { // "1:30" 같은 시간 표시나 번호 매기기 방어
        flushBlock(); // 이전 사람 대사 포장!
        
        currentSpeaker = speakerMatch[1].trim(); // 이름표 추출
        if (speakerMatch[2]) {
          currentMessage.push(speakerMatch[2].trim()); // 같은 줄에 대사가 있으면 바구니에 담기
        }
        
        // 🎨 프론트엔드를 위한 역할(Role) 배정
        if (currentSpeaker.includes('가치투자자')) currentRole = 'VALUE';
        else if (currentSpeaker.includes('기술적분석가')) currentRole = 'TECH';
        else if (currentSpeaker.includes('사회자') || currentSpeaker.includes('중재자')) currentRole = 'MODERATOR';
        else currentRole = 'PANEL';
      }
      else if (bracketMatch && (bracketMatch[1].includes('분석가') || bracketMatch[1].includes('투자자'))) {
        flushBlock();
        currentSpeaker = bracketMatch[1].trim();
        currentRole = 'SYSTEM'; // 요약/정리 헤더는 시스템 메시지로 처리
      }
      else if (line.startsWith('토론 시작') || line.includes('라운드')) {
        flushBlock();
        scriptBlocks.push({ speaker: '시스템', role: 'SYSTEM', message: line });
      } 
      else {
        // 이름표가 없으면 무조건 현재 화자의 대사로 이어서 바구니에 담기
        currentMessage.push(line);
      }
    }
    
    flushBlock(); // 마지막 남은 대사까지 확실하게 포장!

    return scriptBlocks;
  }
}