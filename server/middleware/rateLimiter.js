/**
 * In-memory sliding window rate limiter & anti-spam middleware
 * No external Redis dependency required; protects against DDoS, brute force, and automated form spam.
 */

const ipRequests = new Map();

// Periodic cleanup every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipRequests.entries()) {
    if (now - record.startTime > record.windowMs) {
      ipRequests.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Creates a rate limiting middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 mins)
 * @param {number} options.max - Max requests within the window (default: 100)
 * @param {string} options.message - Error message upon limit reached
 */
function rateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = "Too many requests from this IP. Please try again later.",
} = {}) {
  return (req, res, next) => {
    // Determine client IP (handles x-forwarded-for if behind reverse proxy)
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      req.ip ||
      "unknown-ip";

    const key = `${ip}:${req.baseUrl || req.path}`;
    const now = Date.now();

    let record = ipRequests.get(key);

    if (!record || now - record.startTime > windowMs) {
      record = {
        count: 1,
        startTime: now,
        windowMs,
      };
      ipRequests.set(key, record);
      return next();
    }

    record.count += 1;

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - record.count));
    res.setHeader(
      "X-RateLimit-Reset",
      new Date(record.startTime + windowMs).toISOString()
    );

    if (record.count > max) {
      const retryAfterSec = Math.ceil(
        (record.startTime + windowMs - now) / 1000
      );
      res.setHeader("Retry-After", retryAfterSec);

      return res.status(429).json({
        success: false,
        message,
        retryAfter: `${retryAfterSec} seconds`,
      });
    }

    next();
  };
}

/**
 * Anti-spam Honeypot middleware
 * Checks if a bot filled out the hidden field
 */
function honeypotTrap(fieldName = "_hp_trap") {
  return (req, res, next) => {
    if (req.body && req.body[fieldName]) {
      // If the honeypot field has a value, it was filled by an automated bot
      return res.status(400).json({
        success: false,
        message: "Bot submission detected.",
      });
    }
    next();
  };
}

module.exports = {
  rateLimiter,
  honeypotTrap,
};
