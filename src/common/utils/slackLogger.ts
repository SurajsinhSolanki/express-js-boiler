import axios from "axios";
import { ENV } from "./config";

interface SlackMetadata {
	stack?: string;
	requestId?: string;
	environment?: string;
	timestamp?: string;
	[key: string]: any; // Allow arbitrary additional metadata
}

const SLACK_WEBHOOK_URL = ENV.SLACK_WEBHOOK_URL;
const MAX_RETRIES = 1;

/**
 * Sends an error message to Slack.
 * @param errorMessage The main error message to send.
 * @param metadata Optional metadata to include (e.g., stack trace, request ID, environment).
 */
export async function sendErrorToSlack(
	errorMessage: string,
	metadata?: SlackMetadata,
): Promise<void> {
	if (!SLACK_WEBHOOK_URL) {
		console.warn("Slack webhook URL is not configured. Skipping error notification.");
		return;
	}

	const blocks: any[] = [
		{
			type: "header",
			text: {
				type: "plain_text",
				text: ":alert: Application Error :alert:",
				emoji: true,
			},
		},
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: `*Error Message:*\n\`\`\`${errorMessage}\`\`\``,
			},
		},
	];

	if (metadata) {
		const fields = [];

		if (metadata.environment) {
			fields.push({
				type: "mrkdwn",
				text: `*Environment:*\n${metadata.environment}`,
			});
		}
		if (metadata.requestId) {
			fields.push({
				type: "mrkdwn",
				text: `*Request ID:*\n${metadata.requestId}`,
			});
		}
		if (metadata.timestamp) {
			fields.push({
				type: "mrkdwn",
				text: `*Timestamp:*\n${metadata.timestamp}`,
			});
		}

		// Add any other custom metadata fields
		for (const key in metadata) {
			if (
				metadata.hasOwn(metadata, key) &&
				!["stack", "requestId", "environment", "timestamp"].includes(key) &&
				metadata[key] !== undefined
			) {
				fields.push({
					type: "mrkdwn",
					text: `*${key.charAt(0).toUpperCase() + key.slice(1)}:*\n${metadata[key]}`,
				});
			}
		}

		if (fields.length > 0) {
			blocks.push({
				type: "section",
				fields: fields,
			});
		}

		if (metadata.stack) {
			blocks.push({
				type: "section",
				text: {
					type: "mrkdwn",
					text: `*Stack Trace:*\n\`\`\`${metadata.stack}\`\`\``,
				},
			});
		}
	}

	let retries = 0;
	while (retries <= MAX_RETRIES) {
		try {
			await axios.post(SLACK_WEBHOOK_URL, { blocks });
			console.log("Error message sent to Slack successfully.");
			return;
		} catch (error) {
			console.error(`Failed to send error to Slack (attempt ${retries + 1}):`, error);
			retries++;
			if (retries > MAX_RETRIES) {
				console.error("Max retries reached. Slack notification failed permanently.");
			}
		}
	}
}
