import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";

const DEFAULT_REGION = process.env.AWS_REGION?.trim() || "us-east-1";
export const DEFAULT_BEDROCK_MODEL = process.env.BEDROCK_MODEL_ID?.trim() || "global.anthropic.claude-sonnet-4-5-20250929-v1:0";

function createBedrockClient() {
  const region = process.env.BEDROCK_REGION?.trim() || DEFAULT_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  const sessionToken = process.env.AWS_SESSION_TOKEN?.trim();

  const credentialConfig =
    accessKeyId && secretAccessKey
      ? {
          accessKeyId,
          secretAccessKey,
          ...(sessionToken ? { sessionToken } : {}),
        }
      : { credentialProvider: fromNodeProviderChain() };

  return createAmazonBedrock({
    region,
    ...credentialConfig,
  });
}

const bedrock = createBedrockClient();

export function normalizeBedrockModel(model?: string) {
  const normalized = model?.trim();
  if (!normalized) return DEFAULT_BEDROCK_MODEL;
  if (normalized.startsWith("gemini-")) return DEFAULT_BEDROCK_MODEL;
  return normalized;
}

export function bedrockModel(model?: string) {
  return bedrock(normalizeBedrockModel(model));
}
