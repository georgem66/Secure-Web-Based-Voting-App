import { securityLogger } from '../utils/logger.js';

export const auditLogger = (req, res, next) => {
  // Skip logging for health checks and static assets
  if (req.path === '/health' || req.path.startsWith('/static/')) {
    return next();
  }

  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function(body) {
    const responseTime = Date.now() - startTime;
    
    // Log the request and response
    securityLogger.info('API Request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous',
      statusCode: res.statusCode,
      responseTime,
      timestamp: new Date().toISOString(),
      // Log query parameters for GET requests (be careful with sensitive data)
      ...(req.method === 'GET' && Object.keys(req.query).length > 0 && {
        queryParams: Object.keys(req.query)
      }),
      // Log if it's an authentication endpoint
      ...(req.path.startsWith('/api/auth') && {
        authEndpoint: true
      }),
      // Log if it's a voting endpoint
      ...(req.path.startsWith('/api/voting') && {
        votingEndpoint: true
      }),
    });

    return originalSend.call(this, body);
  };

  next();
};