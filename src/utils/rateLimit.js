import { LRUCache } from 'lru-cache';

// Configure rate limiting
const rateLimit = (options) => {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60 * 1000, // 1 minute by default
  });

  return {
    check: (req, limit, token) =>
      new Promise((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || [0];
        
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        
        tokenCount[0] += 1;
        
        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;
        
        // Add rate limiting headers
        req.rateLimit = {
          limit,
          current: currentUsage,
          remaining: isRateLimited ? 0 : limit - currentUsage,
        };
        
        return isRateLimited ? reject() : resolve();
      }),
  };
};

// Configure account lockout
const lockoutTime = 15 * 60 * 1000; // 15 minutes
const maxFailedAttempts = 5;

const accountLockout = new Map();

export const checkAccountLockout = (ip) => {
  const lockout = accountLockout.get(ip);
  
  if (lockout) {
    if (lockout.remainingAttempts <= 0) {
      const timeSinceLockout = Date.now() - lockout.timestamp;
      
      if (timeSinceLockout < lockoutTime) {
        // Still locked out
        const remainingTime = Math.ceil((lockoutTime - timeSinceLockout) / 1000 / 60);
        return {
          isLockedOut: true,
          remainingTime,
          message: `Too many failed attempts. Please try again in ${remainingTime} minutes.`
        };
      } else {
        // Lockout period has ended, reset
        accountLockout.delete(ip);
      }
    }
  }
  
  return { isLockedOut: false };
};

export const recordFailedAttempt = (ip) => {
  const lockout = accountLockout.get(ip) || {
    remainingAttempts: maxFailedAttempts,
    timestamp: 0,
  };
  
  lockout.remainingAttempts--;
  
  if (lockout.remainingAttempts <= 0) {
    lockout.timestamp = Date.now();
  }
  
  accountLockout.set(ip, lockout);
  
  return lockout.remainingAttempts;
};

export const resetFailedAttempts = (ip) => {
  accountLockout.delete(ip);
};

// Create rate limiter: 5 requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per minute
});

export const rateLimiter = async (req, res) => {
  try {
    // Use IP address for rate limiting
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    await limiter.check(res, 5, ip); // 5 requests per minute
  } catch (error) {
    return res.status(429).json({ 
      error: 'Too many requests. Please try again later.' 
    });
  }
};
