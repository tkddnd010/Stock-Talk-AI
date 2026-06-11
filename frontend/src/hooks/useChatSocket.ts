import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { apiClient } from '../api/client';

export interface ChatMessage {
  speaker: string;
  role: 'VALUE' | 'TECH' | 'MODERATOR' | 'SYSTEM' | 'PANEL';
  message: string;
}

export const useChatSocket = (symbol: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 방 이동 시 초기화
    setMessages([]);

    const fetchHistory = async () => {
      try {
        const response = await apiClient.get(`/api/reports/history/${symbol}`);
        setMessages(response.data);
      } catch (error) {
        console.error('과거 대화 기록을 불러오는데 실패했습니다.', error);
      }
    };
    fetchHistory();

    if (!socketRef.current) {
      const token = localStorage.getItem('accessToken');
      socketRef.current = io('http://localhost:3000', {
        auth: { token: token ?? '' },
      });
    }

    socketRef.current.emit('joinRoom', symbol);

    const handleNewMessage = (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    };
    socketRef.current.on('debate_message', handleNewMessage);

    return () => {
      socketRef.current?.off('debate_message', handleNewMessage);
    };
  }, [symbol]);

  return { messages };
};