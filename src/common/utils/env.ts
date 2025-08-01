import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

class EnvManager {
    private static instance: EnvManager;
    private env: Record<string, string> = {};

    private constructor(envFile = '.env') {
        this.loadEnv(envFile);
    }

    static getInstance(envFile?: string): EnvManager {
        if (!EnvManager.instance) {
            EnvManager.instance = new EnvManager(envFile);
        }
        return EnvManager.instance;
    }

    private loadEnv(envFile: string) {
        const filePath = path.resolve(process.cwd(), envFile);

        if (fs.existsSync(filePath)) {
            const result = dotenv.config({ path: filePath });

            if (result.error) {
                console.warn(`⚠️ Error loading env file: ${result.error}`);
            }
        } else {
            console.warn(`⚠️ .env file not found at ${filePath}, using process.env only.`);
        }

        this.env = {
            ...this.env,
            ...(process.env as Record<string, string>)
        };
    }

    get(key: string): string {
        if (!this.exists(key)) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
        return this.env[key];
    }

    getOptional(key: string, defaultValue: string): string {
        return this.exists(key) ? this.env[key] : defaultValue;
    }

    exists(key: string): boolean {
        return key in this.env;
    }

    getAsNumber(key: string): number {
        if (!this.exists(key)) {
            throw new Error(`❌ Environment variable "${key}" is required but not set.`);
        }

        const value = this.env[key];
        const parsed = Number(value);

        if (isNaN(parsed)) {
            throw new Error(`❌ Environment variable "${key}" must be a valid number. Got: "${value}"`);
        }

        return parsed;
    }

    getAsBoolean(key: string): boolean {
        if (!this.exists(key)) {
            throw new Error(`❌ Environment variable "${key}" is required but not set.`);
        }

        const value = this.env[key].toLowerCase();
        return ['true', '1', 'yes'].includes(value);
    }

    getAsNumberOptional(key: string, defaultValue: number): number {
        if (!this.exists(key)) return defaultValue;
        const val = Number(this.env[key]);
        return isNaN(val) ? defaultValue : val;
    }

    getAsBooleanOptional(key: string, defaultValue = false): boolean {
        if (!this.exists(key)) return defaultValue;
        return ['true', '1', 'yes'].includes(this.env[key].toLowerCase());
    }
}

export default EnvManager;
