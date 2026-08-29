import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../utils/axios';

export const BlogPostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'market-analysis',
    tags: '',
    imageUrl: '',
    author: 'JodhpurTraders Editorial',
    readTime: '5',
    isFeatured: false,
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const fetchBlog = async () => {
        setFetching(true);
        try {
          const response = await api.get(`/blogs/${id}`);
          if (response.data.success) {
            const data = response.data.data;
            setFormData({
              title: data.title || '',
              excerpt: data.excerpt || '',
              content: data.content || '',
              category: data.category || 'market-analysis',
              tags: data.tags ? data.tags.join(', ') : '',
              imageUrl: data.imageUrl || '',
              author: data.author || 'JodhpurTraders Editorial',
              readTime: data.readTime?.toString() || '5',
              isFeatured: data.isFeatured || false,
              isActive: data.isActive || false
            });
          }
        } catch (err) {
          setError('Failed to fetch article details');
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchBlog();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formattedData = {
      ...formData,
      readTime: parseInt(formData.readTime, 10) || 5,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
    };

    try {
      if (isEditMode) {
        await api.put(`/blogs/${id}`, formattedData);
      } else {
        await api.post('/blogs', formattedData);
      }
      navigate('/blogs');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong while saving.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64 text-navy-950 font-semibold">
        Fetching article data...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-navy-950">
            {isEditMode ? 'Edit Blog Post' : 'Add New Article'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Write tutorials, analysis, or market news updates</p>
        </div>
        <Link to="/blogs" className="text-xs font-bold text-gray-500 hover:text-navy-950">
          ← Cancel and Return
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-xs font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
            Article Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Fundamental Analysis Guide: How to read a Balance Sheet"
            className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none bg-white text-navy-950"
              required
            >
              <option value="market-analysis">Market Analysis</option>
              <option value="education">Education</option>
              <option value="ipo-review">IPO Review</option>
              <option value="sector-analysis">Sector Analysis</option>
              <option value="personal-finance">Personal Finance</option>
              <option value="news">News & Updates</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Author
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Read Time (mins)
            </label>
            <input
              type="number"
              name="readTime"
              value={formData.readTime}
              onChange={handleChange}
              placeholder="5"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Cover Image URL
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="investing, guides, finance, learning"
              className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
            Short Excerpt / Preview
          </label>
          <input
            type="text"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="A short preview sentence that appears on index boards..."
            className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-navy-950 mb-1.5 uppercase tracking-wide">
            Article Content
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write the full post contents..."
            rows="10"
            className="w-full px-4 py-3 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            required
          />
        </div>

        <div className="flex space-x-6">
          <label className="flex items-center space-x-2 text-xs font-bold text-navy-950 cursor-pointer">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="w-4 h-4 text-brand-500 rounded border-gray-300 focus:ring-brand-500"
            />
            <span>FEATURED ON HOMEPAGE</span>
          </label>

          <label className="flex items-center space-x-2 text-xs font-bold text-navy-950 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-brand-500 rounded border-gray-300 focus:ring-brand-500"
            />
            <span>ACTIVE / VISIBLE</span>
          </label>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl text-xs transition"
          >
            {loading ? 'Saving Article...' : isEditMode ? 'Save Article' : 'Publish Article'}
          </button>
        </div>
      </form>
    </div>
  );
};
