import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { PostDetailModal } from './PostDetailModal';

interface Post {
  id: number;
  symbol: string;
  title: string;
  content: string;
  author: string;
  type: 'INDIVIDUAL';
  createdAt: string;
}

interface PaginatedPosts {
  data: Post[];
  total: number;
  page: number;
  totalPages: number;
}

type SymbolFilter = 'ALL' | string;

interface PostListProps {
  symbols: string[];
}

export const PostList = ({ symbols }: PostListProps) => {
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolFilter>('ALL');
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    setPage(1);
  }, [selectedSymbol]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const baseUrl =
          selectedSymbol === 'ALL'
            ? '/api/reports/individual'
            : `/api/reports/${selectedSymbol}`;
        const response = await apiClient.get<PaginatedPosts>(baseUrl, {
          params: { page },
        });
        setPosts(response.data.data);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('게시글을 불러오지 못했습니다.', error);
        setPosts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [selectedSymbol, page]);

  const emptyMessage =
    selectedSymbol === 'ALL'
      ? '아직 등록된 개별 분석 리포트가 없습니다.'
      : `${selectedSymbol} 종목의 개별 분석 리포트가 없습니다.`;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-900">
      <h2 className="text-3xl font-bold text-white mb-6">📚 AI 분석 리포트</h2>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedSymbol('ALL')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            selectedSymbol === 'ALL'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
          }`}
        >
          전체
        </button>
        {symbols.map((symbol) => (
          <button
            key={symbol}
            onClick={() => setSelectedSymbol(symbol)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedSymbol === symbol
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            {symbol}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center text-gray-400 mt-16">게시글을 불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-500 mt-16">{emptyMessage}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-lg hover:shadow-xl hover:border-blue-500 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400">
                    {post.symbol} · 개별 분석
                  </span>
                  <span className="text-gray-500 text-sm">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h3>

                <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                  {post.content}
                </p>

                <div className="flex items-center text-sm font-medium text-gray-500">
                  ✍️ 작성자: <span className="text-gray-300 ml-1">{post.author}</span>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                이전
              </button>
              <span className="text-gray-400 text-sm">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}

      {selectedPost && (
        <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
};
