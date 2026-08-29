import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/axios';

export const SocialModeration = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, reported, hidden, pinned
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState('');

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus === 'reported') params.isReported = 'true';
      if (filterStatus === 'hidden') params.status = 'hidden';
      if (filterStatus === 'pinned') params.isPinned = 'true';
      if (search) params.search = search;

      const res = await api.get('/social/admin/posts', { params });
      if (res.data.success) {
        setPosts(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin social posts:', err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleTogglePin = async (id) => {
    try {
      const res = await api.post(`/social/posts/${id}/pin`);
      if (res.data.success) {
        showToast(res.data.message);
        loadPosts();
      }
    } catch (err) {
      alert('Failed to update pin status');
    }
  };

  const handleModerateStatus = async (id, action) => {
    try {
      const res = await api.post(`/social/posts/${id}/moderate`, { action });
      if (res.data.success) {
        showToast(res.data.message);
        loadPosts();
      }
    } catch (err) {
      alert('Failed to update post status');
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this post?')) return;
    try {
      const res = await api.delete(`/social/posts/${id}`);
      if (res.data.success) {
        showToast('Post deleted permanently');
        setPosts(prev => prev.filter(p => p._id !== id));
      }
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold">
          ✓ {notification}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Social Media Community Moderation</h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Admin Tool
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Review reported posts, pin market insights, and manage trader discussions.</p>
        </div>

        <button
          onClick={loadPosts}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition"
        >
          🔄 Refresh Feed
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'All Posts' },
            { id: 'reported', label: '⚠️ Reported Posts' },
            { id: 'pinned', label: '📌 Pinned Posts' },
            { id: 'hidden', label: '🙈 Hidden / Moderated' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterStatus === f.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search symbol, author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Posts Table / Cards */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-2"></div>
          <p className="text-xs text-gray-500 font-medium">Loading social posts for moderation...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <h3 className="text-base font-bold text-gray-700">No posts match this filter</h3>
          <p className="text-xs text-gray-500">All community posts are clean and compliant!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post._id}
              className={`bg-white rounded-2xl p-5 border ${
                post.reportCount > 0 ? 'border-amber-300 bg-amber-50/20' : 'border-gray-200'
              } shadow-sm space-y-3`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'T'}
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 text-sm">{post.authorName}</span>
                    <span className="text-[11px] text-gray-500 ml-2">({post.authorRole})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {post.taggedStock && (
                    <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                      ${post.taggedStock}
                    </span>
                  )}
                  {post.sentiment && (
                    <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                      post.sentiment === 'BULLISH' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {post.sentiment}
                    </span>
                  )}
                  {post.isPinned && (
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-xs flex items-center gap-1">
                      📌 Pinned
                    </span>
                  )}
                  {post.status === 'hidden' && (
                    <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-bold text-xs">
                      Hidden
                    </span>
                  )}
                  {post.reportCount > 0 && (
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-xs flex items-center gap-1">
                      ⚠️ Reported ({post.reportCount})
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <p className="text-gray-800 text-sm font-medium leading-relaxed">
                {post.content}
              </p>

              {/* Action Buttons Toolbar */}
              <div className="flex flex-wrap items-center justify-between pt-2 text-xs border-t border-gray-100 gap-3">
                <div className="text-gray-500">
                  <span>Likes: <strong>{post.likeCount}</strong></span> • <span>Comments: <strong>{post.commentsCount}</strong></span> • <span>Date: {new Date(post.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePin(post._id)}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition ${
                      post.isPinned
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📌 {post.isPinned ? 'Unpin' : 'Pin to Top'}
                  </button>

                  {post.status === 'active' ? (
                    <button
                      onClick={() => handleModerateStatus(post._id, 'hide')}
                      className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-lg flex items-center gap-1 transition"
                    >
                      🙈 Hide Post
                    </button>
                  ) : (
                    <button
                      onClick={() => handleModerateStatus(post._id, 'restore')}
                      className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg flex items-center gap-1 transition"
                    >
                      ✓ Restore Post
                    </button>
                  )}

                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg flex items-center gap-1 transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
