const express = require('express');
const TradingIdea = require('../models/TradingIdea');
const IPO = require('../models/IPO');
const BlogPost = require('../models/BlogPost');
const config = require('../config');

const router = express.Router();

/**
 * @route GET /sitemap.xml
 * @desc Generate XML sitemap for SEO
 */
router.get('/', async (req, res) => {
  res.header('Content-Type', 'application/xml');

  const BASE_URL = config.frontendUrl;

  const staticPages = [
    { loc: `${BASE_URL}/`, priority: '1.0' },
    { loc: `${BASE_URL}/trading-ideas`, priority: '0.9' },
    { loc: `${BASE_URL}/ipos`, priority: '0.9' },
    { loc: `${BASE_URL}/blog`, priority: '0.9' },
    { loc: `${BASE_URL}/stocks`, priority: '0.8' },
    { loc: `${BASE_URL}/about`, priority: '0.6' },
    { loc: `${BASE_URL}/contact`, priority: '0.5' },
    { loc: `${BASE_URL}/faq`, priority: '0.5' }
  ];

  try {
    const [ideas, ipos, posts] = await Promise.all([
      TradingIdea.find({ isActive: true }).select('slug updatedAt'),
      IPO.find({ isActive: true }).select('slug updatedAt'),
      BlogPost.find({ isActive: true }).select('slug updatedAt')
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    staticPages.forEach(({ loc, priority }) => {
      xml += `  <url>\n    <loc>${loc}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
    });

    // Dynamic: Trading ideas
    ideas.forEach((idea) => {
      const lastmod = idea.updatedAt
        ? idea.updatedAt.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      xml += `  <url>\n    <loc>${BASE_URL}/trading-ideas/${idea.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Dynamic: IPOs
    ipos.forEach((ipo) => {
      const lastmod = ipo.updatedAt
        ? ipo.updatedAt.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      xml += `  <url>\n    <loc>${BASE_URL}/ipos/${ipo.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // Dynamic: Blog posts
    posts.forEach((post) => {
      const lastmod = post.updatedAt
        ? post.updatedAt.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      xml += `  <url>\n    <loc>${BASE_URL}/blog/${post.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
