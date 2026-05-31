
// 초강력 텍스트 분해기
export function parseDebateScript(fullDebate: string): Array<{ speaker: string, role: string, message: string }> {
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