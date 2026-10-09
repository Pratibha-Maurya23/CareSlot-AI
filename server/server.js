const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const logger = require('./utils/logger');

// Route files
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const recordRoutes = require('./routes/records');
const dashboardRoutes = require('./routes/dashboard');
const promptRoutes = require('./routes/prompts');
const triageRoutes = require('./routes/triage');
const healthHistoryRoutes = require('./routes/healthHistory');

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ─────────────────────────────────────
// CORS — allow requests from frontend with credentials
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL]
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

// HTTPS & Security Headers
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.hostname}${req.url}`);
  }
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Parse Cookies
app.use(cookieParser());

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// HTTP request logger (writes to file and console)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(req, res, duration);
  });
  next();
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const { rateLimiter, honeypotTrap } = require('./middleware/rateLimiter');

// ── Rate Limiting & Anti-Spam Protection (Item 18) ───
const generalApiLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 200 });
const authLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many authentication attempts. Please try again after 15 minutes.' });
const triageLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 50, message: 'Triage request limit reached. Please wait a moment.' });

// Apply general API rate limiter
app.use('/api', generalApiLimiter);

// ── API Routes ─────────────────────────────────────
app.use('/api/auth', authLimiter, honeypotTrap(), authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', honeypotTrap(), appointmentRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/triage', triageLimiter, triageRoutes);
app.use('/api/health-history', healthHistoryRoutes);

// ── Health Check ───────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MediFlow API is running 🚀',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── 404 Handler ────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── Global Error Handler ───────────────────────────
app.use(errorHandler);

// ── Start Server ───────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`MediFlow Server running on port ${PORT} [Env: ${process.env.NODE_ENV || 'development'}]`);
  console.log(`\n🚀 MediFlow Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   API Docs:    http://localhost:${PORT}/api/health\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', err);
  server.close(() => process.exit(1));
});

module.exports = app;
