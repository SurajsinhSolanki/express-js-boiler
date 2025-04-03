import fs from 'fs';
import path from 'path';

// Define supported environment variable types
type EnvType = 'string' | 'number' | 'enum';

// Validation options for environment variables
type ValidationOptions = {
    type: EnvType;
    enumValues?: string[]; // Required for enum validation
};

// Singleton class for managing environment variables
class EnvManager {
    private static instance: EnvManager;
    private env: Record<string, string> = {};

    // Private constructor to prevent direct instantiation
    private constructor(envFile = '.env') {
        this.loadEnv(envFile);
    }

    // Get the singleton instance of EnvManager
    static getInstance(envFile?: string): EnvManager {
        if (!EnvManager.instance) {
            EnvManager.instance = new EnvManager(envFile);
        }
        return EnvManager.instance;
    }

    // Load environment variables from a file or fallback to process.env with dotenv-like features
    private loadEnv(envFile: string) {
        const filePath = path.resolve(process.cwd(), envFile);

        if (fs.existsSync(filePath)) {
            const envData = fs.readFileSync(filePath, 'utf-8');

            envData.split('\n').forEach((line: string) => {
                let cleanedLine = line.trim();

                // Ignore comments and empty lines
                if (!cleanedLine || cleanedLine.startsWith('#')) return;

                // Remove everything after a '#' symbol (comment)
                cleanedLine = cleanedLine.split('#')[0].trim();

                const [key, ...valueParts] = cleanedLine.split('=');
                const value = valueParts.join('=').trim();

                if (key) {
                    this.env[key.trim()] = this.expandEnvVariables(this.removeQuotes(value));
                    // Set environment variables in process.env (similar to dotenv behavior)
                    process.env[key.trim()] = this.env[key.trim()];
                }
            });
        } else {
            console.warn(`Env file not found at ${filePath}, using process.env`);
        }

        this.env = { ...(process.env as Record<string, string>), ...this.env };
    }

    // Helper function to remove quotes (single or double) around the value
    private removeQuotes(value: string): string {
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            return value.slice(1, -1); // Remove first and last character (the quotes)
        }
        return value;
    }

    // Expand variables like ${VAR_NAME} in env values
    private expandEnvVariables(value: string): string {
        return value.replace(/\$\{([^}]+)\}/g, (_, varName) => {
            return this.env[varName] || process.env[varName] || '';
        });
    }

    // Retrieve a value from the environment variables with optional default value
    get(key: string, defaultValue?: string): string {
        if (!this.exists(key)) {
            if (defaultValue !== undefined) return defaultValue;
            console.error(`Environment variable ${key} not found.`);
        }
        return this.env[key];
    }

    // Check if a variable exists in the environment
    exists(key: string): boolean {
        return key in this.env;
    }

    // Validate environment variables based on type and optional enum values
    validate(key: string, options: ValidationOptions): boolean {
        if (!this.exists(key)) {
            console.error(`Key ${key} not found in environment.`);
        }

        let value = this.env[key];
        switch (options.type) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return !isNaN(Number(value));
            case 'enum':
                if (!options.enumValues) {
                    return false;
                }
                value = value.trim();
                value = value.toLowerCase();
                return options.enumValues.includes(value);
            default:
                console.error('Invalid validation type.');
                return false;
        }
    }

    // Retrieve and convert a variable to a number with optional default value
    getAsNumber(key: string, defaultValue?: number): number {
        const value = this.get(key);
        const numberValue = Number(value);
        if (isNaN(numberValue)) {
            console.error(`Invalid number value for ${key}`);
            if (defaultValue !== undefined) return defaultValue;
        }
        return numberValue;
    }

    // Retrieve and convert a variable to a boolean with optional default value
    getAsBoolean(key: string, defaultValue = false): boolean {
        const value = this.get(key);
        if (!value) return defaultValue;
        return ['true', '1', 'yes'].includes(value.toLowerCase());
    }
}

// Export the EnvManager class as the default export
export default EnvManager;
