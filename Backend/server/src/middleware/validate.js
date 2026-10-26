const { z } = require('zod');

const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body);
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details
        }
      });
    }
    return next(error);
  }
};

module.exports = validate;
