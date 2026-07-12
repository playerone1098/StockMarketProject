import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchBlogBySlug } from '../services/api';
import { formatDate } from '../utils/formatters';

export const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const getBlogDetails = async () => {
      setLoading(true);
      try {
        const response = await fetchBlogBySlug(slug);
        if (response.success && response.data) {
          setBlog(response.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching blog details:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    getBlogDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-extrabold text-navy-950">Article Not Found</h2>
        <p className="text-gray-500 text-sm mt-2">The blog post you are looking for does not exist or has been removed.</p>
        <Link to="/blog" className="mt-6 inline-block px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-sm transition">
          Back to Blog Listing
        </Link>
      </div>
    );
  }

  const getCategoryFriendly = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'market-analysis': return 'Market Analysis';
      case 'ipo-review': return 'IPO Review';
      case 'sector-analysis': return 'Sector Analysis';
      case 'personal-finance': return 'Personal Finance';
      default: return cat;
    }
  };

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': blog.title,
    'description': blog.excerpt,
    'image': blog.imageUrl || `${window.location.origin}/og-image.png`,
    'datePublished': blog.createdAt,
    'dateModified': blog.updatedAt || blog.createdAt,
    'author': {
      '@type': 'Person',
      'name': blog.author || 'StockVista Editorial'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'StockVista',
      'logo': {
        '@type': 'ImageObject',
        'url': `${window.location.origin}/logo.png`
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': window.location.origin + window.location.pathname
    }
  };

  return (
    <>
      <Helmet>
        <title>{`${blog.title} | StockVista Blog`}</title>
        <meta name="description" content={blog.excerpt} />
        <meta property="og:title" content={`${blog.title} | StockVista Blog`} />
        <meta property="og:description" content={blog.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.origin + window.location.pathname} />
        {blog.imageUrl && <meta property="og:image" content={blog.imageUrl} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${blog.title} | StockVista Blog`} />
        <meta name="twitter:description" content={blog.excerpt} />
        {blog.imageUrl && <meta name="twitter:image" content={blog.imageUrl} />}
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
        <script type="application/ld+json">
          {JSON.stringify(blogJsonLd)}
        </script>
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Navigation Breadcrumb */}
        <div className="text-xs font-semibold text-gray-400 mb-6 flex items-center space-x-1">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-brand-600">Blog</Link>
          <span>/</span>
          <span className="text-navy-950 truncate max-w-[200px]">{blog.title}</span>
        </div>

        {/* Category badge */}
        <div className="mb-4">
          <span className="text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 px-3 py-0.5 rounded-full capitalize">
            {getCategoryFriendly(blog.category)}
          </span>
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold text-navy-950 mb-4 leading-tight">
          {blog.title}
        </h1>

        <div className="flex items-center space-x-3 text-xs text-gray-400 font-semibold mb-8">
          <span>By {blog.author || 'Editorial Team'}</span>
          <span>•</span>
          <span>{formatDate(blog.createdAt)}</span>
          <span>•</span>
          <span>{blog.readTime || 5} min read</span>
          <span>•</span>
          <span>{blog.viewCount || 0} views</span>
        </div>

        {/* Cover Image */}
        {blog.imageUrl && (
          <div className="rounded-3xl overflow-hidden h-[250px] md:h-[350px] mb-8 bg-gray-150 border border-gray-100">
            <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Excerpt */}
        <div className="border-l-4 border-navy-900 bg-gray-50 p-5 rounded-r-2xl mb-8">
          <p className="text-xs text-navy-950 font-medium italic leading-relaxed">{blog.excerpt}</p>
        </div>

        {/* Main Content Body */}
        <div className="prose prose-navy max-w-none text-navy-950 text-sm leading-relaxed whitespace-pre-line mb-10">
          {blog.content}
        </div>

        {/* Article Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 py-4 border-t border-b border-gray-50">
            {blog.tags.map((tag) => (
              <span key={tag} className="text-[10px] font-bold text-navy-700 bg-navy-100 px-2.5 py-1 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Financial Disclaimer */}
        <div className="bg-gray-50 border border-gray-150 rounded-2xl p-5 text-xs text-gray-500 leading-relaxed">
          <h4 className="font-bold text-navy-950 mb-1.5">Educational Disclaimer</h4>
          <p>
            The views expressed in this article are purely educational and opinion-based. They do not constitute investment advice or recommendations. Investing in capital markets is highly speculative and subject to rapid price fluctuations. Please consult a registered investment advisor before committing capital.
          </p>
        </div>
      </div>
    </>
  );
};
