import cluster from 'cluster';
import os from 'os';
import { env } from './envConfig';
import { logger } from '@/server';

export const createCluster = (startServer: () => void) => {
    if (cluster.isPrimary) {
        const numCPUs = os.cpus().length;
        const clusterCount = Math.min(env.CLUSTER_COUNT, numCPUs);
        logger.info(`Primary process ${process.pid} is running`);
        logger.info(`Starting ${clusterCount} worker(s)`);

        // Fork workers for each CPU
        for (let i = 0; i < clusterCount; i++) {
            cluster.fork();
        }

        // Handle worker exit
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
