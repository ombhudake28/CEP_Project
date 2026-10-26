const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const languageMiddleware = require('./middleware/language');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const healthRoutes = require('./routes/health.routes');
const scamsRoutes = require('./routes/scams.routes');
const quizRoutes = require('./routes/quiz.routes');
const helplinesRoutes = require('./routes/helplines.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));

// Parse JSON payload with 10kb limit
app.use(express.json({ limit: '10kb' }));

// Logging configuration
// Never log request bodies for /api/report, Morgan combined doesn't log body by default.
// It just logs method, path, status, response time, etc.
app.use(morgan(isProduction ? 'combined' : 'dev'));

// Rate limiters using exactly the requested RATE_LIMITED error code structure
const limiterHandler = (req, res, next) => {
  res.status(429).json({
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later.'
    }
  });
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  handler: limiterHandler
});

const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  handler: limiterHandler
});

// Middleware for API routes
app.use('/api', apiLimiter);
app.use('/api', languageMiddleware);

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/scams', scamsRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/helplines', helplinesRoutes);
app.use('/api/report', reportLimiter, reportRoutes);

// 404 for unknown API routes
app.use('/api/*', notFound);

// Serve static frontend in production
if (isProduction) {
  // src is inside server, client is sibling to server
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  
  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    
    // React Router fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  }
}

// Global Error Handler
app.use(errorHandler);

module.exports = app;
