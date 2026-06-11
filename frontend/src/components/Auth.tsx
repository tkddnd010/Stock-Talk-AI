import { useState } from 'react';
import { apiClient } from '../api/client';

interface UserInfo {
  nickname: string;
}

export const Auth = ({ onLogin }: { onLogin: (user: UserInfo) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  // 💡 1. 입력값을 담을 State 추가
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');

  // 💡 2. 폼 제출 시 백엔드 API 호출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        // [로그인] API 호출 (주소는 백엔드 라우터 설정에 맞게 수정 필요)
        const response = await apiClient.post('/api/auth/login', {
          email,
          password,
        });

        localStorage.setItem('accessToken', response.data.access_token);

        const profileRes = await apiClient.get('/api/users/personalInfo');
        onLogin({ nickname: profileRes.data.nickname });
      } else {
        // [회원가입] API 호출
        await apiClient.post('/api/auth/signup', {
          email,
          password,
          nickname,
        });
        
        alert('회원가입 성공! 이제 로그인해 주세요.');
        setIsLogin(true); // 회원가입 끝나면 로그인 화면으로 샥 넘김
      }
    } catch (error: any) {
      console.error('API 에러:', error);
      alert(error.response?.data?.message || '요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 font-sans">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          {isLogin ? '📈 Stock-Talk-AI' : '회 원 가 입'}
        </h2>

        {/* 💡 3. onSubmit에 우리가 만든 handleSubmit 연결 */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">닉네임</label>
              <input 
                type="text" 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required={!isLogin}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                placeholder="사용할 닉네임을 입력하세요" 
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">이메일</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              placeholder="이메일을 입력하세요" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">비밀번호</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              placeholder="비밀번호를 입력하세요" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors mt-2"
          >
            {isLogin ? '로그인' : '회원가입'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              // 화면 전환 시 입력창 초기화
              setEmail('');
              setPassword('');
              setNickname('');
            }} 
            className="ml-2 text-blue-400 hover:text-blue-300 font-semibold"
          >
            {isLogin ? '회원가입' : '로그인'}
          </button>
        </div>
      </div>
    </div>
  );
};