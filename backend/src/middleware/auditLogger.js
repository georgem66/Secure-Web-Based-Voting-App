import { securityLogger } from '../utils/logger.js';

export const auditLogger = (req, res, next) => {

  if (req.path === '/health' || req.path.startsWith('/static/')) {
    return next();
  }

  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function(body) {
    const responseTime = Date.now() - startTime;

    securityLogger.info('API Request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous',
      statusCode: res.statusCode,
      responseTime,
      timestamp: new Date().toISOString(),

      ...(req.method === 'GET' && Object.keys(req.query).length > 0 && {
        queryParams: Object.keys(req.query)
      }),

      ...(req.path.startsWith('/api/auth') && {
        authEndpoint: true
      }),

      ...(req.path.startsWith('/api/voting') && {
        votingEndpoint: true
      }),
    });

    return originalSend.call(this, body);
  };

  next();
};
