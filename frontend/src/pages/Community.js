import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchSocialPosts,
  fetchSocialTrending,
  createSocialPost,
  toggleSocialPostLike,
  addSocialPostComment,
  reportSocialPost
} from '../services/api';
// Native SVG Icon Components (no external dependencies)

const Sparkles = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z" />
  </svg>
);

const Users = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TrendingUp = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const TrendingDown = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </svg>
);

const Minus = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MessageSquare = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CheckCircle = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const Search = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const AlertCircle = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const Pin = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14l-1.5-6H6.5L5 17z" />
    <path d="M9 11V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7" />
  </svg>
);

const ThumbsUp = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88z" />
  </svg>
);

const Flag = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const Send = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export const Community = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // all, BULLISH, BEARISH, popular
  const [selectedStock, setSelectedStock] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Create post modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [taggedStock, setTaggedStock] = useState('');
  const [sentiment, setSentiment] = useState('BULLISH');
  const [targetPrice, setTargetPrice] = useState('');
  const [timeframe, setTimeframe] = useState('Short Term');
  const [authorName, setAuthorName] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [modalError, setModalError] = useState('');

  // Comment section state
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [notification, setNotification] = useState('');

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeFilter === 'BULLISH' || activeFilter === 'BEARISH') {
        params.sentiment = activeFilter;
      } else if (activeFilter === 'popular') {
        params.sort = 'popular';
      }

      if (selectedStock) {
        params.taggedStock = selectedStock;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const [postsRes, trendingRes] = await Promise.all([
        fetchSocialPosts(params),
        fetchSocialTrending()
      ]);

      if (postsRes.success) {
        setPosts(postsRes.data);
      }
      if (trendingRes.success) {
        setTrending(trendingRes.data);
      }
    } catch (err) {
      console.error('Error loading community feed:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, selectedStock, searchQuery]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  const handleOpenCreateModal = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/community' } });
      return;
    }
    setAuthorName(user?.username || (user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim() : 'JodhpurTraders Trader'));
    setShowCreateModal(true);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/community' } });
      return;
    }

    if (!postContent.trim()) return;

    setModalError('');
    try {
      setPublishing(true);
      const res = await createSocialPost({
        content: postContent,
        taggedStock,
        sentiment,
        targetPrice: targetPrice ? Number(targetPrice) : null,
        timeframe,
        authorName: authorName || user?.username || 'JodhpurTraders Trader'
      });

      if (res.success) {
        setPostContent('');
        setTaggedStock('');
        setTargetPrice('');
        setAuthorName('');
        setModalError('');
        setShowCreateModal(false);
        showToast('🎉 Your insight has been published to the community feed!');
        loadFeed();
      } else {
        setModalError(res.message || 'Failed to publish post. Please try again.');
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.message || 'Failed to publish post. Please sign in and try again.';
      setModalError(serverMessage);
    } finally {
      setPublishing(false);
    }
  };

  const handleLike = async (postId) => {
    if (!isAuthenticated) {
      showToast('🔒 Sign in required to like posts');
      navigate('/login', { state: { from: '/community' } });
      return;
    }

    try {
      const res = await toggleSocialPostLike(postId);
      if (res.success) {
        setPosts(prev => prev.map(p => {
          if (p._id === postId) {
            return {
              ...p,
              likeCount: res.data.likeCount,
              likes: res.data.isLiked ? [...p.likes, user?._id || 'user'] : p.likes.slice(0, -1)
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error('Like error:', err);
      if (err.response?.status === 401) {
        navigate('/login', { state: { from: '/community' } });
      }
    }
  };

  const handleAddComment = async (postId) => {
    if (!isAuthenticated) {
      showToast('🔒 Sign in required to post comments');
      navigate('/login', { state: { from: '/community' } });
      return;
    }

    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await addSocialPostComment(postId, {
        content: text.trim(),
        authorName: user?.username || 'Trader'
      });

      if (res.success) {
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        setExpandedComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), res.data]
        }));
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
        showToast('Comment added');
      }
    } catch (err) {
      console.error('Comment error:', err);
      if (err.response?.status === 401) {
        navigate('/login', { state: { from: '/community' } });
      }
    }
  };


  const handleReport = async (postId) => {
    try {
      const res = await reportSocialPost(postId, { reason: 'Inappropriate or spam content' });
      if (res.success) {
        showToast('⚠️ Post reported to moderators for review.');
      }
    } catch (err) {
      console.error('Report error:', err);
    }
  };

  // Structured JSON-LD Schema
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    'headline': 'JodhpurTraders Trader Community & Social Feed',
    'description': 'Real-time stock market discussions, technical setups, bullish & bearish market forecasts from Indian equity traders.',
    'url': window.location.href,
    'author': {
      '@type': 'Organization',
      'name': 'JodhpurTraders Community'
    }
  };

  // Compute sentiment gauge ratio
  const bullishCount = posts.filter(p => p.sentiment === 'BULLISH').length;
  const totalWithSentiment = posts.length || 1;
  const overallBullishRatio = Math.round((bullishCount / totalWithSentiment) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Trader Community & Stock Social Feed | JodhpurTraders</title>
        <meta
          name="description"
          content="Connect with top stock market traders. Share technical chart setups, target prices, and real-time bullish/bearish market insights for NSE/BSE equities."
        />
        <link rel="canonical" href={`${window.location.origin}/community`} />
        <meta property="og:title" content="Trader Community & Stock Social Feed | JodhpurTraders" />
        <meta property="og:description" content="Share and discuss stock market forecasts, intraday setups, and swing trading ideas." />
        <script type="application/ld+json">{JSON.stringify(jsonLdSchema)}</script>
      </Helmet>

      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-3">
                <Sparkles size={14} /> LIVE TRADER COMMUNITY
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Stock Market Social Hub
              </h1>
              <p className="text-slate-300 mt-2 text-sm sm:text-base max-w-2xl leading-relaxed">
                Connect with Indian retail investors and equity analysts. Share technical charts, price targets, and discuss live setups for NSE/BSE stocks.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleOpenCreateModal}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >

                <Users size={18} /> Share Insight / Post
              </button>
            </div>
          </div>

          {/* Sentiment Meter Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Community Sentiment</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">{overallBullishRatio}% Bullish</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <TrendingUp size={24} />
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Discussions</div>
                <div className="text-lg font-bold text-indigo-400 mt-0.5">{posts.length} Live Threads</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <MessageSquare size={24} />
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Top Tagged Stock</div>
                <div className="text-lg font-bold text-amber-400 mt-0.5">
                  {trending.length > 0 ? `$${trending[0].stock}` : '$RELIANCE'}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                NSE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-indigo-400 animate-bounce text-sm font-semibold">
          <CheckCircle size={18} /> {notification}
        </div>
      )}

      {/* Main Grid: Feed + Trending Sidebar */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left/Main Column: Feed */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Controls Bar: Filters & Search */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => { setActiveFilter('all'); setSelectedStock(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeFilter === 'all' && !selectedStock
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                All Posts
              </button>
              <button
                onClick={() => { setActiveFilter('BULLISH'); setSelectedStock(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-colors ${
                  activeFilter === 'BULLISH'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp size={14} /> Bullish Setups
              </button>
              <button
                onClick={() => { setActiveFilter('BEARISH'); setSelectedStock(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-colors ${
                  activeFilter === 'BEARISH'
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingDown size={14} /> Bearish Warning
              </button>
              <button
                onClick={() => { setActiveFilter('popular'); setSelectedStock(''); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeFilter === 'popular'
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                🔥 Popular
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Search stock, keyword, author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Active Stock Filter Chip */}
          {selectedStock && (
            <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 px-3 py-1.5 rounded-lg text-xs">
              <span>Filtering for <strong>${selectedStock}</strong></span>
              <button onClick={() => setSelectedStock('')} className="hover:text-white font-bold ml-2">✕</button>
            </div>
          )}

          {/* Feed List */}
          {loading ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-xl border border-slate-900">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3"></div>
              <p className="text-slate-400 text-sm">Fetching live community posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-xl border border-slate-800/60">
              <AlertCircle className="mx-auto text-slate-500 mb-3" size={32} />
              <h3 className="text-lg font-semibold text-slate-300">No discussions match your filter</h3>
              <p className="text-slate-500 text-xs mt-1">Be the first to share an insight for this criteria!</p>
              <button
                onClick={handleOpenCreateModal}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
              >

                Create Post
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className={`bg-slate-900/70 border ${
                    post.isPinned ? 'border-indigo-500/50 shadow-indigo-500/10' : 'border-slate-800/80'
                  } rounded-2xl p-5 hover:border-slate-700 transition-all shadow-xl backdrop-blur-sm`}
                >
                  {/* Post Top Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                        {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'T'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100 text-sm">{post.authorName}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20">
                            {post.authorRole || 'Trader'}
                          </span>
                          {post.isPinned && (
                            <span className="text-xs font-bold text-amber-400 flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                              <Pin size={12} /> Pinned
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          {new Date(post.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Stock Ticker & Sentiment Badges */}
                    <div className="flex flex-wrap items-center gap-2 justify-end">
                      {post.taggedStock && (
                        <button
                          onClick={() => setSelectedStock(post.taggedStock)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs border border-indigo-500/30 transition-colors"
                        >
                          ${post.taggedStock}
                        </button>
                      )}

                      {post.sentiment === 'BULLISH' && (
                        <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30 flex items-center gap-1">
                          <TrendingUp size={14} /> BULLISH
                        </span>
                      )}
                      {post.sentiment === 'BEARISH' && (
                        <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/30 flex items-center gap-1">
                          <TrendingDown size={14} /> BEARISH
                        </span>
                      )}
                      {post.sentiment === 'NEUTRAL' && (
                        <span className="px-2.5 py-1 rounded bg-slate-500/20 text-slate-400 font-bold text-xs border border-slate-500/30 flex items-center gap-1">
                          <Minus size={14} /> NEUTRAL
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mt-4">
                    <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>

                    {/* Details bar (Target price, Timeframe) */}
                    {(post.targetPrice || post.timeframe) && (
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                        {post.targetPrice && (
                          <span className="text-slate-300">
                            Target Price: <strong className="text-emerald-400">₹{post.targetPrice}</strong>
                          </span>
                        )}
                        {post.timeframe && (
                          <span className="text-slate-400 border-l border-slate-800 pl-3">
                            Horizon: <strong className="text-indigo-300">{post.timeframe}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleLike(post._id)}
                        className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors font-medium"
                      >
                        <ThumbsUp size={15} />
                        <span>{post.likeCount} Likes</span>
                      </button>

                      <button
                        onClick={() => setExpandedComments(prev => ({
                          ...prev,
                          [post._id]: prev[post._id] ? null : []
                        }))}
                        className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors font-medium"
                      >
                        <MessageSquare size={15} />
                        <span>{post.commentsCount} Comments</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleReport(post._id)}
                        className="hover:text-rose-400 transition-colors flex items-center gap-1"
                        title="Report post"
                      >
                        <Flag size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Inline Comments Drawer */}
                  {expandedComments[post._id] !== undefined && (
                    <div className="mt-4 pt-4 border-t border-slate-800 bg-slate-950/50 rounded-xl p-4">
                      {expandedComments[post._id] && expandedComments[post._id].length > 0 && (
                        <div className="space-y-2 mb-3">
                          {expandedComments[post._id].map((c, idx) => (
                            <div key={idx} className="bg-slate-900/80 p-2.5 rounded-lg text-xs text-slate-300 border border-slate-800/60">
                              <span className="font-bold text-indigo-400 mr-2">{c.authorName}:</span>
                              {c.content}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a reply..."
                          value={commentInputs[post._id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => handleAddComment(post._id)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow"
                        >
                          <Send size={12} /> Comment
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Column: Trending Stocks & Community Rules */}
        <div className="space-y-6">
          
          {/* Trending Tickers Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
              <TrendingUp className="text-emerald-400" size={18} />
              Trending Stock Discussions
            </h3>

            {trending.length === 0 ? (
              <p className="text-xs text-slate-500">No trending tickers yet.</p>
            ) : (
              <div className="space-y-3">
                {trending.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedStock(item.stock)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/50 transition-all text-left group"
                  >
                    <div>
                      <div className="text-sm font-bold text-indigo-300 group-hover:text-indigo-200">
                        ${item.stock}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {item.postCount} {item.postCount === 1 ? 'post' : 'posts'}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        item.sentiment === 'BULLISH'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {item.bullishPercentage}% Bullish
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Guidelines Box */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-400 space-y-2">
            <h4 className="font-bold text-slate-200 text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="text-amber-400" size={16} /> Community Guidelines
            </h4>
            <p>• Share genuine educational & technical stock analysis.</p>
            <p>• Tag stock symbols accurately (e.g. RELIANCE, TATAMOTORS).</p>
            <p>• Respect opinions; financial markets involve risks.</p>
            <p>• Posts promoting guaranteed returns will be moderated.</p>
          </div>

        </div>

      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
            
            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="text-indigo-400" size={20} /> Publish Trader Insight
            </h3>
            <p className="text-xs text-slate-400 mb-4">Share your technical chart, price target, or news analysis with the community.</p>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name / Alias</label>
                <input
                  type="text"
                  placeholder="e.g. Market_Explorer"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tagged Stock Ticker (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. RELIANCE, TATAMOTORS, NIFTY50"
                  value={taggedStock}
                  onChange={(e) => setTaggedStock(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 uppercase"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Sentiment</label>
                  <select
                    value={sentiment}
                    onChange={(e) => setSentiment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="BULLISH">🚀 Bullish</option>
                    <option value="BEARISH">📉 Bearish</option>
                    <option value="NEUTRAL">⚖️ Neutral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Target Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 3200"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Timeframe</label>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Intraday">Intraday</option>
                    <option value="Short Term">Short Term</option>
                    <option value="Swing">Swing</option>
                    <option value="Long Term">Long Term</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Post Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain your technical rationale, key resistance levels, catalyst, or news..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-bold rounded-lg shadow-lg shadow-indigo-600/30 flex items-center gap-1"
                >
                  {publishing ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Community;
