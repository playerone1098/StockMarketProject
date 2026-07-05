import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatters';

export const BlogCard = ({ blog }) => {
  const getCategoryFriendly = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'market-analysis': return 'Market Analysis';
      case 'ipo-review': return 'IPO Review';
      case 'sector-analysis': return 'Sector Analysis';
      case 'personal-finance': return 'Personal Finance';
      default: return cat;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between card-hover">
      <div>
        <Link to={`/blog/${blog.slug}`} className="block overflow-hidden h-44 bg-navy-100 relative">
          {blog.imageUrl ? (
            <img 
              src={blog.imageUrl} 
              alt={blog.title} 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-navy-400 font-bold bg-gradient-to-br from-navy-50 to-navy-200">
              StockVista
            </div>
          )}
          <span className="absolute top-3 left-3 bg-brand-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize">
            {getCategoryFriendly(blog.category)}
          </span>
        </Link>

        <div className="p-5">
          <div className="flex items-center text-[10px] text-gray-400 space-x-2 mb-2 font-medium">
            <span>By {blog.author || 'Editorial'}</span>
            <span>•</span>
            <span>{formatDate(blog.createdAt)}</span>
            <span>•</span>
            <span>{blog.readTime || 5} min read</span>
          </div>

          <Link to={`/blog/${blog.slug}`} className="block group">
            <h3 className="font-bold text-navy-950 text-base leading-snug mb-2 group-hover:text-brand-600 transition">
              {blog.title}
            </h3>
          </Link>

          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {blog.excerpt}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 pt-0">
        <Link 
          to={`/blog/${blog.slug}`}
          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center transition"
        >
          Read Article →
        </Link>
      </div>
    </div>
  );
};
