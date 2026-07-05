const { validationResult } = require('express-validator');

/**
 * Validation middleware factory.
 * Checks express-validator results and returns errors or proceeds.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg
      }))
    });
  }
  next();
};

module.exports = validate;
