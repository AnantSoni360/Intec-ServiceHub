require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
const pinoHttp = require('pino-http');

const app = express();
app.set('trust proxy', 1);

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});
app.use(pinoHttp({ logger }));

// Security: Restrict CORS
if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  logger.fatal('FATAL ERROR: FRONTEND_URL is not defined in production');
  process.exit(1);
}

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL.replace(/\/$/, '') : '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
const path = require('path');
// Removed unauthenticated static uploads route. Attachments are served securely via ticket routes.

// Security: Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window for login
  message: { success: false, message: 'Too many login attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter);

// Connect to MongoDB
if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<db_password>')) {
  logger.fatal('FATAL ERROR: Valid MONGO_URI is not defined in .env');
  process.exit(1);
}

mongoose.set('sanitizeFilter', true);
mongoose.connect(process.env.MONGO_URI, { family: 4 })
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => {
    logger.error('Could not connect to MongoDB:', err);
    process.exit(1);
  });

// Import routes
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const assetRoutes = require('./routes/assets');
const onboardingRoutes = require('./routes/onboarding');
const adminRoutes = require('./routes/admin');

// Serve data templates for onboarding
app.use('/data_templates', express.static(path.join(__dirname, 'data_templates')));

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler for Pino structured logging
app.use((err, req, res, next) => {
  req.log.error(err);
  res.status(500).json({ message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
