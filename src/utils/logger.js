import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const transports = [
  new winston.transports.Console({
    format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  }),
];

if (process.env.NODE_ENV !== 'test') {
  transports.push(
    new DailyRotateFile({
      filename: path.join(process.env.LOG_DIR || 'logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(timestamp(), errors({ stack: true }), logFormat),
    }),
    new DailyRotateFile({
      filename: path.join(process.env.LOG_DIR || 'logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(timestamp(), logFormat),
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(errors({ stack: true }), timestamp()),
  transports,
  exitOnError: false,
});

export default logger;
