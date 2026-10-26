const notFound = (req, res, next) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested API route does not exist'
    }
  });
};

module.exports = notFound;
