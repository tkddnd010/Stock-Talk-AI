import { useState, useEffect } from 'react';
import { useChatSocket } from './hooks/useChatSocket';
import { useSmartScroll } from './hooks/useSmartScroll';
import { Auth } from './components/Auth';
import { PostList } from './components/PostList';

// 💡 한 글자씩 타닥타닥 쳐주는 마법의 타자기 컴포넌트
const TypewriterBubble = ({ text, onType }: { text: string; onType: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
        onType(); // 💡 글자가 쳐질 때마다 부모의 강제 스크롤 함수 호출!
      } else {
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayedText}</span>;
};

// 💡 3개의 반도체 관심 종목
const AVAILABLE_SYMBOLS = ['LRCX', 'AMAT', 'TSM'];

function App() {
  // 상태 관리
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [symbol, setSymbol] = useState<string>('LRCX');
  const [currentView, setCurrentView] = useState<'CHAT' | 'BOARD'>('CHAT');
  
  // 커스텀 훅 로직
  const { messages } = useChatSocket(symbol);
  const { messagesEndRef, chatContainerRef, handleScroll, forceScrollDown } = useSmartScroll([messages]);

  // 🚨 로그인 바리케이드
  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      
      {/* 💡 왼쪽 사이드바 영역 */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-8 text-white">📈 Stock Talk AI</h1>
        
        {/* 메인 메뉴 (게시판 전환) */}
        <div className="mb-8">
          <h2 className="text-sm text-gray-400 font-semibold mb-3 uppercase tracking-wider">메인 메뉴</h2>
          <button
            onClick={() => setCurrentView('BOARD')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium mb-2 ${
              currentView === 'BOARD' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            📚 AI 분석 게시판
          </button>
        </div>

        {/* 토론방 목록 (채팅방 전환) */}
        <h2 className="text-sm text-gray-400 font-semibold mb-4 uppercase tracking-wider">토론방 목록</h2>
        <ul className="space-y-2">
          {AVAILABLE_SYMBOLS.map((s) => (
            <li key={s}>
              <button
                onClick={() => {
                  setSymbol(s);
                  setCurrentView('CHAT'); // 방을 누르면 무조건 채팅 화면으로 전환
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center justify-between ${
                  currentView === 'CHAT' && symbol === s
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }`}
              >
                <span>{s}</span>
                {currentView === 'CHAT' && symbol === s && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 💡 오른쪽 메인 화면 영역 (게시판 or 채팅창) */}
      {currentView === 'BOARD' ? (
        <PostList symbols={AVAILABLE_SYMBOLS} />
      ) : (
        <div className="flex-1 flex flex-col p-4 md:p-8">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            {/* 채팅창 헤더 */}
            <div className="bg-gray-800 p-4 rounded-t-xl border-b border-gray-700 flex items-center justify-between shadow-lg">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-blue-400">#</span> {symbol} AI 실시간 토론방
              </h2>
              <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">Live</span>
            </div>
            
            {/* 채팅창 본문 */}
            <div 
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto bg-gray-800 p-4 rounded-b-xl shadow-lg space-y-6"
            >
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">과거 토론 내역을 불러오는 중입니다...</div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className="flex flex-col animate-fade-in-up">
                    <span className={`text-sm font-bold mb-1 ml-1 ${
                      msg.role === 'VALUE' ? 'text-green-400' : 
                      msg.role === 'TECH' ? 'text-red-400' : 
                      msg.role === 'MODERATOR' ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      {msg.speaker}
                    </span>
                    
                    <div className={`p-3 rounded-2xl max-w-[90%] leading-relaxed shadow-sm inline-block ${
                      msg.role === 'SYSTEM' ? 'bg-gray-700/50 text-gray-300 italic rounded-tl-xl text-center mx-auto' : 'bg-gray-700 text-gray-100 rounded-tl-none'
                    }`}>
                      {index < messages.length - 1 ? (
                        msg.message
                      ) : (
                        <TypewriterBubble text={msg.message} onType={forceScrollDown} />
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;