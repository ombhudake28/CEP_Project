const errorHandler = (err, req, res, next) => {
  // If headers have already been sent to the client, delegate to the default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.status || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';
  const details = err.details || undefined;

  const errorResponse = {
    error: {
      code: errorCode,
      message,
      ...(details && { details })
    }
  };

  // Log error (avoid logging stack trace entirely if in prod due to constraints)
  if (!isProduction) {
    console.error(err);
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
