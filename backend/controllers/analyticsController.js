const Analytics = require('../models/Analytics');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { ANALYTICS_EVENT_TYPES } = require('../utils/constants');

/**
 * Track an analytics event (public).
 */
const trackEvent = catchAsync(async (req, res) => {
  const { eventType, path, resourceId, resourceTitle } = req.body;

  if (!path) {
    throw new ApiError(400, 'Path is required');
  }

  const type = eventType && ANALYTICS_EVENT_TYPES.includes(eventType)
    ? eventType
    : 'page_view';

  await Analytics.create({
    eventType: type,
    path,
    resourceId: resourceId || undefined,
    resourceTitle: resourceTitle || undefined
  });

  res.status(201).json({
    success: true,
    message: 'Event recorded'
  });
});

/**
 * Get aggregated analytics stats (admin).
 */
const getStats = catchAsync(async (req, res) => {
  const [
    totalPageViews,
    totalIdeaViews,
    totalIpoViews,
    totalBlogViews,
    totalStockViews,
    topPages,
    topContent,
    recentActivity
  ] = await Promise.all([
    Analytics.countDocuments({ eventType: 'page_view' }),
    Analytics.countDocuments({ eventType: 'trading_idea_view' }),
    Analytics.countDocuments({ eventType: 'ipo_view' }),
    Analytics.countDocuments({ eventType: 'blog_view' }),
    Analytics.countDocuments({ eventType: 'stock_view' }),
    Analytics.aggregate([
      { $match: { eventType: 'page_view' } },
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    Analytics.aggregate([
      { $match: { eventType: { $ne: 'page_view' } } },
      {
        $group: {
          _id: { resourceId: '$resourceId', resourceTitle: '$resourceTitle', eventType: '$eventType' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          resourceId: '$_id.resourceId',
          resourceTitle: '$_id.resourceTitle',
          eventType: '$_id.eventType',
          count: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    Analytics.find()
      .sort({ createdAt: -1 })
      .limit(20)
  ]);

  res.json({
    success: true,
    data: {
      totalPageViews,
      totalIdeaViews,
      totalIpoViews,
      totalBlogViews,
      totalStockViews,
      topPages,
      topContent,
      recentActivity
    }
  });
});

module.exports = { trackEvent, getStats };
