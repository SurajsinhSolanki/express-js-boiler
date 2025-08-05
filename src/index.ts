import { ENV } from '@/common/utils/config';
import { app, logger } from '@/server';
import { createCluster } from './common/utils/cluster';
import net from 'net';

const isPortFree = (port: number) => {
  return new Promise(resolve => {
    const tester = net
      .createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.close();
        resolve(true);
      })
      .listen(port);
  });
};

const startServer = async () => {
  let PORT = ENV.PORT;

  while (true) {
    let attempts = 0;
    while (attempts < 3) {
      if (await isPortFree(PORT)) {
        break;
      }
      logger.warn(`Attempt ${attempts + 1}: Port ${PORT} is not available. Retrying in 5 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    if (attempts === 3) {
      logger.warn(`Port ${PORT} failed after 3 attempts. Trying a new port.`);
      PORT = Math.floor(3000 + Math.random() * 1000);
    } else {
      break;
    }
  }

  const server = app.listen(PORT, () => {
    const { NODE_ENV, HOST } = ENV;
    logger.info(
      `Server (${NODE_ENV}) running on http://${HOST}:${PORT} ${
        ENV.CLUSTER_ENABLED ? `(Worker ID: ${process.pid})` : ''
      }`
    );
  });

  const onCloseSignal = async () => {
    logger.info('Shutting down server...');

    await new Promise(resolve => {
      server.close(err => {
        if (err) {
          logger.error('Error during shutdown:', err);
          process.exit(1);
        }
        logger.info('Server closed gracefully');
        resolve(null);
      });
    });

    process.exit(0);
  };

  process.on('SIGINT', onCloseSignal);
  process.on('SIGTERM', onCloseSignal);
  process.on('beforeExit', onCloseSignal);
  process.on('SIGUSR2', onCloseSignal);
};

if (ENV.CLUSTER_ENABLED === true) {
  createCluster(startServer);
} else {
  startServer();
}
