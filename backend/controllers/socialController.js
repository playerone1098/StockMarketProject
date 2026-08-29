const SocialPost = require('../models/SocialPost');
const SocialComment = require('../models/SocialComment');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

/**
 * Get public social media posts with filters & pagination
 */
const getAllPosts = catchAsync(async (req, res) => {
  const {
    taggedStock,
    sentiment,
    search,
    sort = 'latest',
    page = 1,
    limit = 12
  } = req.query;

  const filter = { status: 'active' };

  if (taggedStock) {
    filter.taggedStock = taggedStock.toUpperCase();
  }

  if (sentiment) {
    filter.sentiment = sentiment.toUpperCase();
  }

  if (search) {
    filter.$or = [
      { content: { $regex: search, $options: 'i' } },
      { taggedStock: { $regex: search, $options: 'i' } },
      { authorName: { $regex: search, $options: 'i' } }
    ];
  }

  let sortCriteria = { isPinned: -1, createdAt: -1 };
  if (sort === 'popular') {
    sortCriteria = { isPinned: -1, likeCount: -1, commentsCount: -1, createdAt: -1 };
  } else if (sort === 'oldest') {
    sortCriteria = { isPinned: -1, createdAt: 1 };
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const [posts, total] = await Promise.all([
    SocialPost.find(filter)
      .populate('author', 'username profile.avatar profile.firstName profile.lastName')
      .sort(sortCriteria)
      .skip(skip)
      .limit(parseInt(limit, 10)),
    SocialPost.countDocuments(filter)
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
 * Get post by ID
 */
const getPostById = catchAsync(async (req, res) => {
  const post = await SocialPost.findById(req.params.id)
    .populate('author', 'username profile.avatar profile.firstName profile.lastName');

  if (!post || post.status === 'hidden') {
    throw new ApiError(404, 'Social post not found');
  }

  const comments = await SocialComment.find({ post: post._id })
    .populate('author', 'username profile.avatar')
    .sort({ createdAt: 1 });

  res.json({
    success: true,
    data: {
      post,
      comments
    }
  });
});

/**
 * Create a new social post
 */
const createPost = catchAsync(async (req, res) => {
  const {
    content,
    taggedStock,
    sentiment,
    targetPrice,
    timeframe,
    chartImageUrl,
    authorName,
    authorRole
  } = req.body;

  if (!content || !content.trim()) {
    throw new ApiError(400, 'Post content is required');
  }

  const validSentiments = ['BULLISH', 'BEARISH', 'NEUTRAL'];
  const validTimeframes = ['Intraday', 'Short Term', 'Swing', 'Long Term', 'N/A'];

  const safeSentiment = (sentiment && validSentiments.includes(sentiment.toUpperCase()))
    ? sentiment.toUpperCase()
    : 'NEUTRAL';

  const safeTimeframe = (timeframe && validTimeframes.includes(timeframe))
    ? timeframe
    : 'Short Term';

  const parsedTargetPrice = (targetPrice !== undefined && targetPrice !== null && targetPrice !== '' && !isNaN(Number(targetPrice)))
    ? Number(targetPrice)
    : null;

  if (!req.user) {
    throw new ApiError(401, 'Please sign in to publish community posts');
  }

  let resolvedAuthorName = req.user.username;
  if (!resolvedAuthorName) {
    const fn = req.user.profile?.firstName || '';
    const ln = req.user.profile?.lastName || '';
    const full = `${fn} ${ln}`.trim();
    if (full) resolvedAuthorName = full;
    else resolvedAuthorName = 'JodhpurTraders Member';
  }

  const postData = {
    content: content.trim(),
    taggedStock: taggedStock ? taggedStock.trim().toUpperCase() : '',
    sentiment: safeSentiment,
    targetPrice: parsedTargetPrice,
    timeframe: safeTimeframe,
    chartImageUrl: chartImageUrl ? chartImageUrl.trim() : '',
    authorName: resolvedAuthorName,
    authorRole: authorRole || (req.user.role === 'admin' ? 'Market Analyst' : 'Pro Trader'),
    author: req.user._id,
    authorAvatar: req.user.profile?.avatar || ''
  };

  const post = await SocialPost.create(postData);

  res.status(201).json({
    success: true,
    data: post,
    message: 'Post published successfully'
  });
});

/**
 * Like / Unlike a post
 */
const toggleLike = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Please sign in to like posts');
  }

  const { id } = req.params;
  const userId = req.user._id.toString();

  const post = await SocialPost.findById(id);
  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  const hasLiked = post.likes.includes(userId);

  if (hasLiked) {
    post.likes = post.likes.filter(uid => uid !== userId);
    post.likeCount = Math.max(0, post.likeCount - 1);
  } else {
    post.likes.push(userId);
    post.likeCount += 1;
  }

  await post.save();

  res.json({
    success: true,
    data: {
      likeCount: post.likeCount,
      isLiked: !hasLiked
    },
    message: hasLiked ? 'Unliked post' : 'Liked post'
  });
});

/**
 * Add a comment to a post
 */
const addComment = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Please sign in to add comments');
  }

  const { id } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    throw new ApiError(400, 'Comment content is required');
  }

  const post = await SocialPost.findById(id);
  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  let resolvedAuthorName = req.user.username;
  if (!resolvedAuthorName) {
    const fn = req.user.profile?.firstName || '';
    const ln = req.user.profile?.lastName || '';
    resolvedAuthorName = `${fn} ${ln}`.trim() || 'JodhpurTraders Member';
  }

  const commentData = {
    post: post._id,
    content: content.trim(),
    authorName: resolvedAuthorName,
    author: req.user._id,
    authorAvatar: req.user.profile?.avatar || ''
  };

  const comment = await SocialComment.create(commentData);

  post.commentsCount += 1;
  await post.save();

  res.json({
    success: true,
    data: comment,
    message: 'Comment added'
  });
});


/**
 * Get comments for a post
 */
const getComments = catchAsync(async (req, res) => {
  const comments = await SocialComment.find({ post: req.params.id })
    .populate('author', 'username profile.avatar')
    .sort({ createdAt: 1 });

  res.json({
    success: true,
    data: comments
  });
});

/**
 * Report a post for moderation
 */
const reportPost = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const post = await SocialPost.findById(id);
  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  post.isReported = true;
  post.reportReason = reason || 'Inappropriate financial content';
  await post.save();

  res.json({
    success: true,
    message: 'Post reported to moderators'
  });
});

/**
 * Get trending stocks mentioned in social community
 */
const getTrendingStocks = catchAsync(async (req, res) => {
  const trending = await SocialPost.aggregate([
    { $match: { status: 'active', taggedStock: { $ne: '' } } },
    {
      $group: {
        _id: '$taggedStock',
        postCount: { $sum: 1 },
        bullishCount: {
          $sum: { $cond: [{ $eq: ['$sentiment', 'BULLISH'] }, 1, 0] }
        },
        bearishCount: {
          $sum: { $cond: [{ $eq: ['$sentiment', 'BEARISH'] }, 1, 0] }
        }
      }
    },
    { $sort: { postCount: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    data: trending.map(t => ({
      stock: t._id,
      postCount: t.postCount,
      bullishPercentage: Math.round((t.bullishCount / (t.postCount || 1)) * 100),
      sentiment: t.bullishCount >= t.bearishCount ? 'BULLISH' : 'BEARISH'
    }))
  });
});

/**
 * Admin: Get all posts for moderation
 */
const getAdminPosts = catchAsync(async (req, res) => {
  const { status, reported, search, page = 1, limit = 15 } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (reported === 'true') filter.isReported = true;
  if (search) {
    filter.$or = [
      { content: { $regex: search, $options: 'i' } },
      { taggedStock: { $regex: search, $options: 'i' } },
      { authorName: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const [posts, total, reportedCount] = await Promise.all([
    SocialPost.find(filter)
      .sort({ isReported: -1, isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10)),
    SocialPost.countDocuments(filter),
    SocialPost.countDocuments({ isReported: true })
  ]);

  res.json({
    success: true,
    data: posts,
    stats: {
      reportedCount
    },
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / parseInt(limit, 10))
    }
  });
});

/**
 * Admin: Moderate a post (update status, pin, clear report)
 */
const moderatePost = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, isPinned, clearReport } = req.body;

  const post = await SocialPost.findById(id);
  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  if (status) post.status = status;
  if (typeof isPinned === 'boolean') post.isPinned = isPinned;
  if (clearReport) {
    post.isReported = false;
    post.reportReason = '';
  }

  await post.save();

  res.json({
    success: true,
    data: post,
    message: 'Post updated successfully'
  });
});

/**
 * Delete a post (Admin or Author)
 */
const deletePost = catchAsync(async (req, res) => {
  const { id } = req.params;
  const post = await SocialPost.findById(id);
  
  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  // Delete associated comments
  await SocialComment.deleteMany({ post: post._id });
  await SocialPost.findByIdAndDelete(post._id);

  res.json({
    success: true,
    message: 'Post and associated comments deleted successfully'
  });
});

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  toggleLike,
  addComment,
  getComments,
  reportPost,
  getTrendingStocks,
  getAdminPosts,
  moderatePost,
  deletePost
};
