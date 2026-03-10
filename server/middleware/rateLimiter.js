const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const keyGenerator = (req) => {
  // Use ipKeyGenerator for proper IPv6 handling
  return ipKeyGenerator(req.ip);
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  standardHeaders: true, 
  legacyHeaders: false,
  keyGenerator,
  validate: { ip: false },
  message: {
    message: 'Too many requests. Please try again later.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  validate: { ip: false },
  message: {
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
