import { useRef, useEffect } from 'react';

export const useSmartScroll = (dependencies: any[]) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // 💡 핵심: useState 대신 useRef를 써서 실시간 스크롤 상태를 '박제' 없이 0.1초 단위로 추적!
  const isAtBottomRef = useRef(true);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    
    // 오차 범위 50px로 맨 밑인지 판단
    const isBottom = scrollHeight - scrollTop <= clientHeight + 50;
    isAtBottomRef.current = isBottom; // 휠을 굴릴 때마다 센서 즉시 갱신
  };

  // 새 메시지가 도착할 때 맨 밑이면 부드럽게 스크롤
  useEffect(() => {
    if (isAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [...dependencies]);

  // 타자기가 쳐질 때 픽셀 단위로 스크롤을 바닥에 강제 고정하는 함수
  const forceScrollDown = () => {
    // 💡 실시간 Ref 값을 참조하기 때문에, 타이핑 도중에 유저가 스크롤을 위로 올리면(isAtBottomRef=false) 즉시 멱살 놓아줌!
    if (isAtBottomRef.current && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  return { messagesEndRef, chatContainerRef, handleScroll, forceScrollDown };
};