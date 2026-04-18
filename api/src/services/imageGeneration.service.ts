import { generateObject, generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export interface ImageGenerationOptions {
  prompt: string;
  level?: number;
  sentiment?: 'positive' | 'negative';
}

export interface ImageGenerationResult {
  success: boolean;
  imageData?: string; // Base64 encoded image
  error?: string;
}

// Image generation prompt schema
const imagePromptSchema = z.object({
  optimizedPrompt: z.string().min(10).max(1000),
  style: z.enum(['illustration', 'realistic', 'anime', 'watercolor', 'cartoon']),
  colorPalette: z.array(z.string()).max(5),
  composition: z.enum(['centered', 'landscape', 'portrait', 'square']),
});

export class ImageGenerationServiceError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ImageGenerationServiceError";
    this.status = status;
  }
}

/**
 * Generate an optimized image prompt based on the reward description
 */
async function optimizePrompt(
  description: string,
  level: number = 1,
  sentiment: 'positive' | 'negative' = 'positive'
): Promise<z.infer<typeof imagePromptSchema>> {
  const levelStyles: Record<number, string> = {
    1: 'simple, cute, warm illustration style',
    2: 'sophisticated, artistic, professional illustration',
    3: 'masterpiece quality, Van Gogh inspired, museum-worthy art',
  };

  const style = levelStyles[level] || levelStyles[1];

  try {
    const { object } = await generateObject({
      model: google(DEFAULT_GEMINI_MODEL),
      schema: imagePromptSchema,
      prompt: `You are an expert prompt engineer for AI image generation.

Create an optimized image generation prompt based on this reward description:
"${description}"

Style requirements:
- Level ${level} reward style: ${style}
- Sentiment: ${sentiment}
- Target: 512x512 image
- Should be uplifting, positive, and visually appealing

Provide:
1. An optimized, detailed prompt (English, 50-200 words)
2. Art style category
3. Primary color palette (3-5 hex colors)
4. Composition type`,
    });

    return object;
  } catch (error) {
    console.error("Failed to optimize prompt:", error);
    // Fallback to basic prompt
    return {
      optimizedPrompt: `A beautiful illustration representing: ${description}. Style: ${style}. High quality, detailed, vibrant colors, uplifting mood.`,
      style: 'illustration',
      colorPalette: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
      composition: 'square',
    };
  }
}

/**
 * Build image generation prompt based on optimized parameters
 */
function buildFinalPrompt(params: z.infer<typeof imagePromptSchema>, level: number): string {
  const styleModifiers: Record<string, string> = {
    illustration: 'flat illustration, vector art style, clean lines, minimal shading',
    realistic: 'photorealistic, detailed textures, natural lighting, high resolution',
    anime: 'anime style, cel shading, vibrant colors, expressive characters',
    watercolor: 'watercolor painting, soft edges, flowing colors, artistic texture',
    cartoon: 'cartoon style, bold outlines, playful, friendly characters',
  };

  const levelModifiers: Record<number, string> = {
    1: 'simple, cute, beginner-friendly, warm and cozy',
    2: 'sophisticated, artistic, professional quality, stunning',
    3: 'masterpiece, museum quality, breathtaking, extraordinary',
  };

  const styleMod = styleModifiers[params.style] || styleModifiers.illustration;
  const levelMod = levelModifiers[level] || levelModifiers[1];

  return `${params.optimizedPrompt}

Style: ${styleMod}
Quality: ${levelMod}
Colors: ${params.colorPalette.join(', ')}
Composition: ${params.composition}

No text, no watermarks, no borders, clean image suitable for display.`;
}

/**
 * Generate an image using Google's Imagen (if available) or fallback to placeholder
 */
async function generateImageWithAI(prompt: string): Promise<ImageGenerationResult> {
  try {
    // For now, we'll use a service to generate images
    // In production, you might want to use:
    // - Google Imagen API
    // - OpenAI DALL-E
    // - Stability AI
    // - Or a Chinese service like Baidu ERNIE-ViLG

    // For this implementation, we'll use Pollinations.ai (free, no API key needed)
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${Date.now()}`;

    console.log("Generating image with URL:", imageUrl.substring(0, 100) + "...");

    // Fetch the image
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.status} ${response.statusText}`);
    }

    // Get image as array buffer and convert to base64
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // Detect content type from response or default to jpeg
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return {
      success: true,
      imageData: `data:${contentType};base64,${base64Image}`,
    };
  } catch (error) {
    console.error("Image generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during image generation",
    };
  }
}

/**
 * Main function to generate an image for a mood redemption reward
 */
export async function generateRewardImage(
  description: string,
  level: number = 1,
  sentiment: 'positive' | 'negative' = 'positive'
): Promise<ImageGenerationResult> {
  try {
    console.log(`Generating reward image: level=${level}, sentiment=${sentiment}`);
    console.log(`Description: ${description}`);

    // Step 1: Optimize the prompt
    const optimizedParams = await optimizePrompt(description, level, sentiment);
    console.log("Optimized prompt params:", JSON.stringify(optimizedParams, null, 2));

    // Step 2: Build final prompt
    const finalPrompt = buildFinalPrompt(optimizedParams, level);
    console.log("Final prompt:", finalPrompt.substring(0, 200) + "...");

    // Step 3: Generate image
    const result = await generateImageWithAI(finalPrompt);

    if (result.success) {
      console.log("Image generated successfully!");
    } else {
      console.error("Image generation failed:", result.error);
    }

    return result;
  } catch (error) {
    console.error("Unexpected error in generateRewardImage:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate a placeholder image (for testing or when AI generation fails)
 */
export function generatePlaceholderImage(
  level: number = 1,
  sentiment: 'positive' | 'negative' = 'positive'
): string {
  // Create a simple SVG placeholder
  const colors: Record<number, string> = {
    1: '#FFD700',
    2: '#FF6347',
    3: '#DA70D6',
  };

  const color = colors[level] || colors[1];
  const label = `Lv.${level} ${sentiment === 'positive' ? 'Reward' : 'Release'}`;

  const svg = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:${color};stop-opacity:0.8" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)"/>
  <circle cx="256" cy="200" r="80" fill="${color}" opacity="0.6"/>
  <text x="256" y="350" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#333">${label}</text>
  <text x="256" y="380" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#666">AI Image Placeholder</text>
</svg>
  `.trim();

  // Convert to base64
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}
