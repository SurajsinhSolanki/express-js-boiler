import EnvManager from './env';

const envManager = EnvManager.getInstance();

// Validate and retrieve environment variables
const NODE_ENV = envManager.get('NODE_ENV', 'development');
if (
    !envManager.validate('NODE_ENV', {
        type: 'enum',
        enumValues: ['development', 'production', 'test'],
    })
) {
    throw new Error('Invalid NODE_ENV value');
}

const HOST = envManager.get('HOST', 'localhost');
const PORT = envManager.getAsNumber('PORT', 3000);
const CORS_ORIGIN = envManager.get('CORS_ORIGIN', '*');
const COMMON_RATE_LIMIT_MAX_REQUESTS = envManager.getAsNumber('COMMON_RATE_LIMIT_MAX_REQUESTS', 1000);
const COMMON_RATE_LIMIT_WINDOW_MS = envManager.getAsNumber('COMMON_RATE_LIMIT_WINDOW_MS', 1000);
const CLUSTER_ENABLED = envManager.getAsBoolean('CLUSTER_ENABLED', false);
const CLUSTER_COUNT = envManager.getAsNumber('CLUSTER_COUNT', 1);
const ALLOWED_ORIGINS = envManager.get('ALLOWED_ORIGINS', '*');

export const env = {
    NODE_ENV,
    HOST,
    PORT,
    CORS_ORIGIN,
    COMMON_RATE_LIMIT_MAX_REQUESTS,
    COMMON_RATE_LIMIT_WINDOW_MS,
    isProduction: NODE_ENV === 'production',
    CLUSTER_ENABLED,
    CLUSTER_COUNT,
    ALLOWED_ORIGINS,
};
