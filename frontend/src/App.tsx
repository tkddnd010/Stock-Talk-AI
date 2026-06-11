import { useState, useEffect } from 'react';
import { apiClient } from './api/client';
import { useChatSocket } from './hooks/useChatSocket';
import { useSmartScroll } from './hooks/useSmartScroll';
import { Auth } from './components/Auth';
import { PostList } from './components/PostList';

interface UserInfo {
  nickname: string;
}

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [symbol, setSymbol] = useState<string>('LRCX');
  const [currentView, setCurrentView] = useState<'CHAT' | 'BOARD'>('CHAT');

  const { messages } = useChatSocket(symbol);
  const { messagesEndRef, chatContainerRef, handleScroll, forceScrollDown } = useSmartScroll([messages]);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const response = await apiClient.get('/api/users/personalInfo');
        setUser({ nickname: response.data.nickname });
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('accessToken');
      } finally {
        setAuthLoading(false);
      }
    };
    restoreSession();
  }, []);

  const handleLogin = (userInfo: UserInfo) => {
    setUser(userInfo);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-gray-400">
        로딩 중...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      
      {/* 💡 왼쪽 사이드바 영역 */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-4 text-white">📈 Stock Talk AI</h1>

        {user && (
          <div className="mb-8 p-3 bg-gray-900/50 rounded-xl border border-gray-700 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">👤</span>
              <span className="text-sm font-medium text-gray-200 truncate">{user.nickname}</span>
            </div>
            <button
              onClick={handleLogout}
              className="shrink-0 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              로그아웃
            </button>
          </div>
        )}

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

        <p className="mt-auto pt-6 text-xs text-gray-500 leading-relaxed">
          ⚠️ 본 서비스의 AI 분석 및 토론 내용은 단순 참고용이며, 투자 권유를 목적으로 하지 않습니다. 투자 결정과 그에 따른 법적 책임은 투자자 본인에게 있습니다.
        </p>
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