import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';

export const BlogPosts = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await api.get('/blogs/admin/all');
        if (response.data.success) {
          setBlogs(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        const response = await api.delete(`/blogs/${id}`);
        if (response.data.success) {
          setBlogs(blogs.filter(blog => blog._id !== id));
        }
      } catch (error) {
        console.error('Error deleting blog:', error);
        alert('Failed to delete blog post');
      }
    }
  };

  const getCategoryFriendly = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'market-analysis': return 'Market Analysis';
      case 'ipo-review': return 'IPO Review';
      case 'sector-analysis': return 'Sector Analysis';
      case 'personal-finance': return 'Personal Finance';
      default: return cat;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-navy-950 font-semibold">
        Loading articles...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-navy-950">Blog Posts</h1>
          <p className="text-gray-500 text-sm mt-1">Author market commentary, sector analytics, and educational reviews</p>
        </div>
        <Link
          to="/blogs/new"
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition"
        >
          New Article
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase">
              <tr>
                <th className="px-6 py-4 text-left">Article Title</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">Author</th>
                <th className="px-6 py-4 text-left">Read Time</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-navy-950">{blog.title}</div>
                    <div className="text-[10px] text-gray-400 truncate max-w-[300px]">{blog.excerpt}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-navy-800 capitalize">
                    {getCategoryFriendly(blog.category)}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium">
                    {blog.author || 'Editorial'}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium">
                    {blog.readTime || 5} Min
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full border ${
                      blog.isActive 
                        ? 'bg-brand-50 text-brand-700 border-brand-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {blog.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {blog.isFeatured && (
                      <span className="ml-2 px-2.5 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-bold">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/blogs/${blog._id}/edit`}
                        className="bg-navy-50 hover:bg-navy-100 text-navy-800 px-3 py-1.5 rounded-lg transition"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(blog._id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
