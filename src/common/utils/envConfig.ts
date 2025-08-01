import EnvManager from './env';

const envManager = EnvManager.getInstance();

export const env = {
    NODE_ENV: envManager.get('NODE_ENV'),
    HOST: envManager.getOptional('HOST', 'localhost'),
    PORT: envManager.getAsNumberOptional('PORT', 3000),

    CORS_ORIGIN: envManager.getOptional('CORS_ORIGIN', '*'),
    ALLOWED_ORIGINS: envManager.getOptional('ALLOWED_ORIGINS', '*'),

    COMMON_RATE_LIMIT_MAX_REQUESTS: envManager.getAsNumberOptional('COMMON_RATE_LIMIT_MAX_REQUESTS', 1000),
    COMMON_RATE_LIMIT_WINDOW_MS: envManager.getAsNumberOptional('COMMON_RATE_LIMIT_WINDOW_MS', 1000),

    CLUSTER_ENABLED: envManager.getAsBooleanOptional('CLUSTER_ENABLED', false),
    CLUSTER_COUNT: envManager.getAsNumberOptional('CLUSTER_COUNT', 1),

    isProduction: envManager.get('NODE_ENV') === 'production',

    LOG_LEVEL: envManager.getOptional('LOG_LEVEL', 'debug')
};
