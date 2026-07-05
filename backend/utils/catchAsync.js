/**
 * Wraps an async route handler to catch errors and pass them to next().
 * Eliminates repetitive try-catch blocks in controllers.
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
