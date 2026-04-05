import 'dotenv/config';
import app from './app.js';
import connectDB from './config/database.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    logger.info(`API Docs: http://localhost:${PORT}/api-docs`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      const { default: mongoose } = await import('mongoose');
      await mongoose.connection.close();
      logger.info('MongoDB connection closed. Process terminated.');
      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise Rejection:', reason);
    shutdown('unhandledRejection');
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    shutdown('uncaughtException');
  });
};

startServer();
