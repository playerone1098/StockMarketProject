const BlogPost = require('../models/BlogPost');
const Analytics = require('../models/Analytics');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { syncNewsData } = require('../utils/newsSyncService');

/**
 * Get all active blog posts with filters and pagination.
 */
const getAll = catchAsync(async (req, res) => {
  const { category, search, page = 1, limit = 12 } = req.query;

  const filter = { isActive: true };
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const [posts, total] = await Promise.all([
    BlogPost.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10)),
    BlogPost.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: posts,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / parseInt(limit, 10))
    }
  });
});

/**
 * Get all blog posts for admin (includes inactive).
 */
const getAdminAll = catchAsync(async (req, res) => {
  const { category, search, page = 1, limit = 12 } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const [posts, total] = await Promise.all([
    BlogPost.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10)),
    BlogPost.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: posts,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / parseInt(limit, 10))
    }
  });
});

/**
 * Get a single blog post by slug. Increments view count.
 */
const getBySlug = catchAsync(async (req, res) => {
  const post = await BlogPost.findOne({
    slug: req.params.slug,
    isActive: true
  });

  if (!post) {
    throw new ApiError(404, 'Blog post not found');
  }

  post.viewCount += 1;
  await post.save();

  await Analytics.create({
    eventType: 'blog_view',
    path: `/blog/${post.slug}`,
    resourceId: post._id,
    resourceTitle: post.title
  });

  res.json({ success: true, data: post });
});

/**
 * Get featured active blog posts (limit 6).
 */
const getFeatured = catchAsync(async (req, res) => {
  const posts = await BlogPost.find({ isActive: true, isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(6);

  res.json({ success: true, data: posts });
});

/**
 * Create a new blog post (admin).
 */
const create = catchAsync(async (req, res) => {
  const post = await BlogPost.create(req.body);
  res.status(201).json({
    success: true,
    data: post,
    message: 'Blog post created successfully'
  });
});

/**
 * Update a blog post by ID (admin).
 */
const update = catchAsync(async (req, res) => {
  const post = await BlogPost.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!post) {
    throw new ApiError(404, 'Blog post not found');
  }

  res.json({
    success: true,
    data: post,
    message: 'Blog post updated successfully'
  });
});

/**
 * Delete a blog post by ID (admin).
 */
const remove = catchAsync(async (req, res) => {
  const post = await BlogPost.findByIdAndDelete(req.params.id);

  if (!post) {
    throw new ApiError(404, 'Blog post not found');
  }

  res.json({
    success: true,
    message: 'Blog post deleted successfully'
  });
});

/**
 * Trigger manual news synchronization (admin).
 */
const syncNews = catchAsync(async (req, res) => {
  const result = await syncNewsData();

  if (!result.success) {
    throw new ApiError(500, `News synchronization failed: ${result.error}`);
  }

  res.json({
    success: true,
    message: 'Market news synced successfully',
    data: {
      insertedCount: result.inserted,
      errors: result.errors
    }
  });
});

module.exports = {
  getAll,
  getAdminAll,
  getBySlug,
  getFeatured,
  create,
  update,
  remove,
  syncNews
};
