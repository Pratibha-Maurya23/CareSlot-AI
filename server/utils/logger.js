const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create logs directory:', err.message);
  }
}

const appLogPath = path.join(logsDir, 'app.log');
const errorLogPath = path.join(logsDir, 'error.log');

const formatTimestamp = () => new Date().toISOString();

const appendToFile = (filePath, line) => {
  try {
    fs.appendFileSync(filePath, line + '\n', 'utf8');
  } catch (err) {
    console.error('Failed to write to log file:', err.message);
  }
};

const logger = {
  info: (message, meta = '') => {
    const metaStr = meta ? ` | ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
    const logLine = `[${formatTimestamp()}] [INFO]: ${message}${metaStr}`;
    console.log(`\x1b[36m[INFO]\x1b[0m ${message}${metaStr}`);
    appendToFile(appLogPath, logLine);
  },

  warn: (message, meta = '') => {
    const metaStr = meta ? ` | ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
    const logLine = `[${formatTimestamp()}] [WARN]: ${message}${metaStr}`;
    console.warn(`\x1b[33m[WARN]\x1b[0m ${message}${metaStr}`);
    appendToFile(appLogPath, logLine);
  },

  error: (message, error = '') => {
    const errDetails =
      error instanceof Error
        ? error.stack
        : typeof error === 'object'
        ? JSON.stringify(error)
        : error;
    const errStr = errDetails ? ` | Details: ${errDetails}` : '';
    const logLine = `[${formatTimestamp()}] [ERROR]: ${message}${errStr}`;
    console.error(`\x1b[31m[ERROR]\x1b[0m ${message}${errStr}`);
    appendToFile(appLogPath, logLine);
    appendToFile(errorLogPath, logLine);
  },

  http: (req, res, durationMs) => {
    const status = res.statusCode;
    const durStr = durationMs !== undefined ? `${durationMs}ms` : '';
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const logLine = `[${formatTimestamp()}] [HTTP]: ${req.method} ${req.originalUrl || req.url} ${status} ${durStr} - IP: ${ip}`;
    appendToFile(appLogPath, logLine);
  },

  debug: (message, meta = '') => {
    if (process.env.NODE_ENV !== 'production') {
      const metaStr = meta ? ` | ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
      const logLine = `[${formatTimestamp()}] [DEBUG]: ${message}${metaStr}`;
      console.log(`\x1b[90m[DEBUG]\x1b[0m ${message}${metaStr}`);
      appendToFile(appLogPath, logLine);
    }
  },
};

module.exports = logger;
