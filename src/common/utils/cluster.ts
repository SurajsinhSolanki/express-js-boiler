import cluster from 'cluster';
import os from 'os';
import { ENV } from './config';
import { logger } from '@/server';

export const createCluster = (startServer: () => void) => {
  if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    const clusterCount = Math.min(ENV.CLUSTER_COUNT, numCPUs);
    logger.info(`Primary process ${process.pid} is running`);
    logger.info(`Starting ${clusterCount} worker(s)`);

    for (let i = 0; i < clusterCount; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      logger.warn(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
      if (code !== 0) {
        logger.info('Starting a new worker');
        cluster.fork();
      }
    });
  } else {
    startServer();
  }
};
