import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

// 백엔드에서 넘겨주는 데이터 타입 정의
interface ChatMessage {
  speaker: string;
  role: 'VALUE' | 'TECH' | 'MODERATOR' | 'SYSTEM' | 'PANEL';
  message: string;
}

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const symbol = 'LRCX'; // 일단 LRCX 방으로 고정해서 테스트!

  useEffect(() => {
    // 💡 1. 방에 입장하자마자 지각생을 위한 '과거 대화 기록' 불러오기
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/reports/history/${symbol}`);
        setMessages(response.data); // 불러온 과거 대화로 화면 채우기
      } catch (error) {
        console.error('과거 대화 기록을 불러오는데 실패했습니다.', error);
      }
    };
    fetchHistory();

    // 💡 2. 방송국(웹소켓) 주파수 맞추기
    socketRef.current = io('http://localhost:3000');

    // 서버와 연결되면 해당 종목 방(LRCX)에 입장!
    socketRef.current.on('connect', () => {
      socketRef.current?.emit('joinRoom', symbol);
    });

    // 💡 3. 실시간으로 날아오는 대본(메시지) 낚아채서 화면에 추가하기
    socketRef.current.on('debate_message', (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]); // 기존 대화 밑에 새 대화 이어붙이기
    });

    // 컴포넌트가 꺼질 때(방을 나갈 때) 소켓 연결 끊기
    return () => {
      socketRef.current?.disconnect();
    };
  }, []); // 빈 배열: 컴포넌트가 처음 켜질 때 딱 한 번만 실행

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto flex flex-col h-[90vh]">
        {/* 헤더 부분 */}
        <div className="bg-gray-800 p-4 rounded-t-xl border-b border-gray-700 flex items-center justify-between shadow-lg">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            {symbol} AI 실시간 토론방
          </h2>
          <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
            Live
          </span>
        </div>
        
        {/* 채팅창 영역 */}
        <div className="flex-1 overflow-y-auto bg-gray-800 p-4 rounded-b-xl shadow-lg space-y-6">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              과거 토론 내역을 불러오는 중이거나 아직 토론이 시작되지 않았습니다...
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="flex flex-col animate-fade-in-up">
                {/* 이름표 */}
                <span className={`text-sm font-bold mb-1 ml-1 ${
                  msg.role === 'VALUE' ? 'text-green-400' : 
                  msg.role === 'TECH' ? 'text-red-400' : 
                  msg.role === 'MODERATOR' ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {msg.speaker}
                </span>
                
                {/* 말풍선 */}
                <div className={`p-3 rounded-2xl max-w-[90%] leading-relaxed shadow-sm inline-block ${
                  msg.role === 'SYSTEM' 
                    ? 'bg-gray-700/50 text-gray-300 italic rounded-tl-xl text-center mx-auto' 
                    : 'bg-gray-700 text-gray-100 rounded-tl-none'
                }`}>
                  {msg.message}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;