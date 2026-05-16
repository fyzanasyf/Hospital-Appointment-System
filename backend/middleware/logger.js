const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logStream = fs.createWriteStream(path.join(logsDir, 'api.log'), { flags: 'a' });

/**
 * Custom logging middleware — records every API request with:
 * timestamp | method | url | status | response-time | ip
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || 'unknown',
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    };

    const logLine = JSON.stringify(logEntry);

    // Write to file
    logStream.write(logLine + '\n');

    // Also print to console (colour-coded by status)
    const statusColor =
      res.statusCode >= 500 ? '\x1b[31m' :   // red
      res.statusCode >= 400 ? '\x1b[33m' :   // yellow
      res.statusCode >= 200 ? '\x1b[32m' :   // green
      '\x1b[36m';                             // cyan

    console.log(
      `${statusColor}[${logEntry.timestamp}] ${req.method} ${req.originalUrl} ` +
      `→ ${res.statusCode} (${duration}ms)\x1b[0m`
    );
  });

  next();
};

module.exports = requestLogger;