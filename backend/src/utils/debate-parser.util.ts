export function parseDebateScript(
    fullDebate: string,
): Array<{ speaker: string; role: string; message: string }> {
    const scriptBlocks: { speaker: string; role: string; message: string }[] = [];

    // 💡 무적의 정규식: 엔터(\n) 상관없이 무조건 대괄호 '[이름표]'를 기준으로 텍스트를 쪼갭니다!
    // 쪼개진 결과: ["", "사회자", " 안녕하세요...", "가치투자자", " 반대합니다..."]
    const parts = fullDebate.split(/\[([^\]]+)\]/);

    // [이름표] 없이 시작하는 안내 멘트나 잡담이 앞에 섞여 있다면 먼저 처리
    if (parts[0] && parts[0].trim() !== '') {
        scriptBlocks.push({
            speaker: '시스템',
            role: 'SYSTEM',
            message: parts[0].trim(),
        });
    }

    // 이름표(홀수 번째)와 대사(짝수 번째)를 짝지어서 바구니에 담기
    for (let i = 1; i < parts.length; i += 2) {
        const currentSpeaker = parts[i].trim();
        const currentMessage = parts[i + 1] ? parts[i + 1].trim() : '';

        // 대사가 없으면 건너뜀
        if (!currentMessage) continue;

        // 프론트엔드를 위한 색깔(Role) 배정
        let currentRole = 'PANEL';
        if (currentSpeaker.includes('가치투자자')) currentRole = 'VALUE';
        else if (currentSpeaker.includes('기술적분석가') || currentSpeaker.includes('기술')) currentRole = 'TECH';
        else if (currentSpeaker.includes('사회자') || currentSpeaker.includes('중재자')) currentRole = 'MODERATOR';

        scriptBlocks.push({
            speaker: currentSpeaker,
            role: currentRole,
            message: currentMessage,
        });
    }

    // 예외 처리: AI가 대괄호를 아예 안 써서 쪼개지지 않았다면 최후의 보루로 통짜 반환
    if (scriptBlocks.length === 0) {
        return [{ speaker: '시스템', role: 'SYSTEM', message: fullDebate.trim() }];
    }

    return scriptBlocks;
}