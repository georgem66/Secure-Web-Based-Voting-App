import { logger, securityLogger } from '../utils/logger.js';

// CSRF protection middleware
export const csrfProtection = (req, res, next) => {
  if (req.method === 'GET') {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    securityLogger.warn('CSRF token validation failed', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      timestamp: new Date().toISOString(),
    });
    
    return res.status(403).json({ 
      success: false, 
      message: 'CSRF token validation failed' 
    });
  }

  next();
};

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Basic XSS prevention
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);

  next();
};

// SQL injection prevention (additional layer)
export const sqlInjectionProtection = (req, res, next) => {
  const checkForSqlInjection = (value) => {
    if (typeof value !== 'string') return false;
    
    const sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /('|(;|--|#|\*|\/\*))/,
      /(\b(OR|AND)\b.*?=.*?=)/i,
    ];
    
    return sqlInjectionPatterns.some(pattern => pattern.test(value));
  };

  const checkObject = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && checkForSqlInjection(value)) {
        securityLogger.warn('Potential SQL injection attempt detected', {
          key,
          value,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.url,
          timestamp: new Date().toISOString(),
        });
        
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid input detected' 
        });
      } else if (typeof value === 'object' && value !== null) {
        const result = checkObject(value);
        if (result) return result;
      }
    }
    return null;
  };

  const result = checkObject({ ...req.body, ...req.query, ...req.params });
  if (result) return result;

  next();
};

// IP-based security checks
export const ipSecurityCheck = (req, res, next) => {
  const clientIp = req.ip;
  
  // Check for suspicious IP patterns
  const suspiciousIps = process.env.BLOCKED_IPS?.split(',') || [];
  
  if (suspiciousIps.includes(clientIp)) {
    securityLogger.warn('Blocked IP attempted access', {
      ip: clientIp,
      url: req.url,
      timestamp: new Date().toISOString(),
    });
    
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied' 
    });
  }

  next();
};

// Combined security middleware
export const securityMiddleware = [
  sanitizeInput,
  sqlInjectionProtection,
  ipSecurityCheck,
];