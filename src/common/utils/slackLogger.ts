import { IncomingWebhook } from '@slack/webhook';
import { ENV } from './config';

interface SlackMetadata {
  stack?: string;
  requestId?: string;
  environment?: string;
  timestamp?: string;
  [key: string]: any; // Allow arbitrary additional metadata
}

const SLACK_WEBHOOK_URL = ENV.SLACK_WEBHOOK_URL;
const MAX_RETRIES = 1;

const webhook = SLACK_WEBHOOK_URL ? new IncomingWebhook(SLACK_WEBHOOK_URL) : null;

/**
 * Sends an error message to Slack.
 * @param errorMessage The main error message to send.
 * @param metadata Optional metadata to include (e.g., stack trace, request ID, environment).
 */
export async function sendErrorToSlack(errorMessage: string, metadata?: SlackMetadata): Promise<void> {
  if (!webhook) {
    console.warn('Slack webhook URL is not configured. Skipping error notification.');
    return;
  }

  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: ':alert: Application Error :alert:',
        emoji: true
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Error Message:*\n\`\`\`${errorMessage}\`\`\``
      }
    }
  ];

  if (metadata) {
    const fields = [];

    if (metadata.environment) {
      fields.push({
        type: 'mrkdwn',
        text: `*Environment:*\n${metadata.environment}`
      });
    }
    if (metadata.requestId) {
      fields.push({
        type: 'mrkdwn',
        text: `*Request ID:*\n${metadata.requestId}`
      });
    }
    if (metadata.timestamp) {
      fields.push({
        type: 'mrkdwn',
        text: `*Timestamp:*\n${metadata.timestamp}`
      });
    }

    // Add any other custom metadata fields
    for (const key in metadata) {
      if (
        metadata.hasOwn(metadata, key) &&
        !['stack', 'requestId', 'environment', 'timestamp'].includes(key) &&
        metadata[key] !== undefined
      ) {
        fields.push({
          type: 'mrkdwn',
          text: `*${key.charAt(0).toUpperCase() + key.slice(1)}:*\n${metadata[key]}`
        });
      }
    }

    if (fields.length > 0) {
      blocks.push({
        type: 'section',
        fields: fields
      });
    }

    if (metadata.stack) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Stack Trace:*\n\`\`\`${metadata.stack}\`\`\``
        }
      });
    }
  }

  let retries = 0;
  while (retries <= MAX_RETRIES) {
    try {
      await webhook.send({ blocks });
      console.log('Error message sent to Slack successfully.');
      return;
    } catch (error) {
      console.error(`Failed to send error to Slack (attempt ${retries + 1}):`, error);
      retries++;
      if (retries > MAX_RETRIES) {
        console.error('Max retries reached. Slack notification failed permanently.');
      }
    }
  }
}

// --- Example Usage ---
async function _exampleUsage() {
  // Set your Slack Webhook URL in your environment variables:
  // SLACK_WEBHOOK_URL="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"

  if (!process.env.SLACK_WEBHOOK_URL) {
    console.warn('\n--- Skipping Slack example: SLACK_WEBHOOK_URL environment variable is not set. ---');
    console.warn('Please set SLACK_WEBHOOK_URL to run the example.\n');
    return;
  }

  console.log('\n--- Running Slack Logger Example ---');

  // Example 1: Basic error message
  await sendErrorToSlack('This is a test error message from the application.');

  // Example 2: Error message with full metadata
  try {
    throw new Error('Something critical went wrong!');
  } catch (err: any) {
    await sendErrorToSlack('Critical application failure!', {
      stack: err.stack,
      requestId: 'req-12345',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      userId: 'user-abc',
      component: 'AuthService'
    });
  }

  // Example 3: Error message with minimal metadata
  await sendErrorToSlack('Database connection failed.', {
    environment: 'production'
  });

  console.log('--- Slack Logger Example Finished ---');
}

// To run the example, uncomment the line below and ensure SLACK_WEBHOOK_URL is set.
// exampleUsage();
