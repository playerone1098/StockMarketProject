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
    <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-sm border border-slate-200 dark:border-navy-800 overflow-hidden flex flex-col justify-between card-hover transition-colors duration-200">
      <div>
        <Link to={`/blog/${blog.slug}`} className="block overflow-hidden h-44 bg-slate-100 dark:bg-navy-950 relative">
          {blog.imageUrl ? (
            <img 
              src={blog.imageUrl} 
              alt={blog.title} 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-navy-400 font-bold bg-gradient-to-br from-slate-100 to-slate-200 dark:from-navy-950 dark:to-navy-800">
              JodhpurTraders
            </div>
          )}
          <span className="absolute top-3 left-3 bg-brand-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize shadow-md">
            {getCategoryFriendly(blog.category)}
          </span>
        </Link>

        <div className="p-5">
          <div className="flex items-center text-[10px] text-slate-500 dark:text-gray-400 space-x-2 mb-2 font-medium">
            <span>By {blog.author || 'Editorial'}</span>
            <span>•</span>
            <span>{formatDate(blog.createdAt)}</span>
            <span>•</span>
            <span>{blog.readTime || 5} min read</span>
          </div>

          <Link to={`/blog/${blog.slug}`} className="block group">
            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
              {blog.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
            {blog.excerpt}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 pt-0">
        <Link 
          to={`/blog/${blog.slug}`}
          className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center transition"
        >
          Read Article
        </Link>
      </div>
    </div>
  );
};
