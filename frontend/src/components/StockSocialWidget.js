import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchSocialPosts, createSocialPost, toggleSocialPostLike, addSocialPostComment } from '../services/api';
// Native symbols and SVG icons used

const StockSocialWidget = ({ symbol }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [sentiment, setSentiment] = useState('BULLISH');
  const [targetPrice, setTargetPrice] = useState('');
  const [timeframe, setTimeframe] = useState('Short Term');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [postComments, setPostComments] = useState({});

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchSocialPosts({ taggedStock: symbol, limit: 10 });
      if (res.success) {
        setPosts(res.data);
      }
    } catch (err) {
      console.error('Error loading stock social posts:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    if (symbol) {
      loadPosts();
    }
  }, [symbol, loadPosts]);

  const handleOpenCreateModal = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/stocks/${symbol}` } });
      return;
    }
    setShowCreateModal(true);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/stocks/${symbol}` } });
      return;
    }

    if (!newPostContent.trim()) return;

    try {
      const res = await createSocialPost({
        content: newPostContent,
        taggedStock: symbol,
        sentiment,
        targetPrice: targetPrice ? Number(targetPrice) : null,
        timeframe,
        authorName: user?.username || 'Trader'
      });

      if (res.success) {
        setNewPostContent('');
        setTargetPrice('');
        setShowCreateModal(false);
        loadPosts();
      } else {
        alert(res.message || 'Failed to publish discussion post');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to publish discussion post. Please check connection.';
      alert(errorMsg);
    }
  };

  const handleLike = async (postId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/stocks/${symbol}` } });
      return;
    }

    try {
      const res = await toggleSocialPostLike(postId);
      if (res.success) {
        setPosts(prev => prev.map(p => {
          if (p._id === postId) {
            return { ...p, likeCount: res.data.likeCount };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  const handleAddComment = async (postId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/stocks/${symbol}` } });
      return;
    }

    if (!commentInput.trim()) return;
    try {
      const res = await addSocialPostComment(postId, {
        content: commentInput,
        authorName: user?.username || 'Trader'
      });
      if (res.success) {
        setCommentInput('');
        setPostComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), res.data]
        }));
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };


  const getSentimentBadge = (sent) => {
    if (sent === 'BULLISH') {
      return <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">BULLISH</span>;
    }
    if (sent === 'BEARISH') {
      return <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">BEARISH</span>;
    }
    return <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-500/20 text-gray-700 dark:text-slate-400 border border-gray-200 dark:border-slate-500/30">NEUTRAL</span>;
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-navy-800">
        <div>
          <h3 className="text-xl font-bold text-navy-950 dark:text-white">
            Community Sentiment & Discussions ({symbol})
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">See what traders and investors are forecasting for {symbol}</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 border border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 hover:border-brand-700 dark:hover:border-brand-300 font-bold text-sm rounded-xl transition-colors bg-transparent"
        >
          Post Insight
        </button>
      </div>

      {showCreateModal && (
        <div className="mb-6 p-5 bg-white dark:bg-navy-850 border border-gray-200 dark:border-navy-700 rounded-2xl shadow-inner">
          <form onSubmit={handleCreatePost}>
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Your Analysis / Thesis</label>
              <textarea
                rows={3}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={`Share your technical setup or news update for ${symbol}...`}
                className="w-full bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-700 rounded-xl p-2.5 text-sm text-navy-950 dark:text-white focus:outline-none focus:border-brand-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-slate-400 mb-1">Sentiment</label>
                <select
                  value={sentiment}
                  onChange={(e) => setSentiment(e.target.value)}
                  className="w-full bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-700 text-navy-950 dark:text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                >
                  <option value="BULLISH">Bullish</option>
                  <option value="BEARISH">Bearish</option>
                  <option value="NEUTRAL">Neutral</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-slate-400 mb-1">Target Price (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 3200"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-700 text-navy-950 dark:text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-slate-400 mb-1">Timeframe</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full bg-white dark:bg-navy-950 border border-gray-300 dark:border-navy-700 text-navy-950 dark:text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                >
                  <option value="Intraday">Intraday</option>
                  <option value="Short Term">Short Term</option>
                  <option value="Swing">Swing</option>
                  <option value="Long Term">Long Term</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 hover:border-gray-400 text-xs font-semibold text-gray-700 dark:text-slate-300 rounded-xl bg-transparent"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-brand-600 dark:border-brand-400 hover:border-brand-700 text-xs font-bold text-brand-600 dark:text-brand-400 rounded-xl bg-transparent"
              >
                Publish Post
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500 dark:text-slate-400 text-sm">Loading community discussions...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl">
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-3">No posts yet for {symbol}. Be the first to share an insight!</p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 border border-brand-600 dark:border-brand-400 hover:border-brand-700 text-brand-600 dark:text-brand-400 text-xs font-bold rounded-xl bg-transparent"
          >
            Create Discussion Post
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="bg-white dark:bg-navy-800/40 border border-gray-200 dark:border-navy-800/80 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border border-gray-300 dark:border-navy-700 bg-white dark:bg-navy-800 flex items-center justify-center font-bold text-brand-600 dark:text-brand-400 text-xs shadow">
                    {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'T'}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-navy-950 dark:text-slate-200">{post.authorName}</span>
                    <span className="text-xs text-brand-600 dark:text-brand-400 ml-2 font-medium">({post.authorRole})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getSentimentBadge(post.sentiment)}
                  {post.targetPrice && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded border border-gray-200 dark:border-navy-700 text-gray-700 dark:text-slate-300">
                      Target: ₹{post.targetPrice}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-700 dark:text-slate-300 text-sm my-3 leading-relaxed">{post.content}</p>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-500 dark:text-slate-400">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post._id)}
                    className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-brand-500 dark:hover:border-brand-400 transition-colors text-xs font-semibold bg-transparent"
                  >
                    <span>{post.likeCount} Likes</span>
                  </button>
                  <button
                    onClick={() => setActiveCommentPostId(activeCommentPostId === post._id ? null : post._id)}
                    className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-brand-500 dark:hover:border-brand-400 transition-colors text-xs font-semibold bg-transparent"
                  >
                    <span>{post.commentsCount} Comments</span>
                  </button>
                </div>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>

              {activeCommentPostId === post._id && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800/60 bg-gray-50 dark:bg-slate-900/40 rounded-xl p-3">
                  {postComments[post._id] && postComments[post._id].length > 0 && (
                    <div className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-1">
                      {postComments[post._id].map((c, i) => (
                        <div key={i} className="text-xs bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-transparent p-2 rounded-lg text-gray-700 dark:text-slate-300">
                          <span className="font-semibold text-brand-600 dark:text-indigo-300 mr-2">{c.authorName}:</span>
                          {c.content}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-navy-950 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                    <button
                      onClick={() => handleAddComment(post._id)}
                      className="px-3 py-1.5 border border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 hover:border-brand-700 rounded-lg text-xs font-bold bg-transparent"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockSocialWidget;
