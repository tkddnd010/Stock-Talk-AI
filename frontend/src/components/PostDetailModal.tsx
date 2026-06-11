import { useEffect } from 'react';

interface Post {
  id: number;
  symbol: string;
  title: string;
  content: string;
  author: string;
  type: 'INDIVIDUAL';
  createdAt: string;
}

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
}

export const PostDetailModal = ({ post, onClose }: PostDetailModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start p-6 border-b border-gray-700">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400">
                {post.symbol} · 개별 분석
              </span>
              <span className="text-gray-500 text-sm">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">{post.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>

        <div className="px-6 py-4 border-t border-gray-700 text-sm font-medium text-gray-500">
          ✍️ 작성자: <span className="text-gray-300 ml-1">{post.author}</span>
        </div>
      </div>
    </div>
  );
};
