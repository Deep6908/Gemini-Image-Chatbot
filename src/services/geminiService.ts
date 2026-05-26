import { GoogleGenerativeAI, Part } from '@google/generative-ai';

// API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!API_KEY) {
  console.warn(
    'Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file.'
  );
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface ConversationHistory {
  role: 'user' | 'model';
  content: string;
}

// System instruction for accurate multimodal image analysis
const SYSTEM_INSTRUCTION = `You are an expert multimodal AI image analysis assistant powered by Google's Gemini Vision model.

Your capabilities include:
- Object identification and classification
- Scene description and understanding
- Image-based question answering
- Visual reasoning and contextual analysis
- Color, texture, and pattern analysis
- Spatial relationship understanding
- Text/OCR recognition in images
- Breed/species identification for animals
- Landmark and location recognition

Instructions:
1. Analyze the uploaded image carefully before responding.
2. Provide accurate, detailed, and context-aware responses based on what you actually see in the image.
3. When identifying objects, animals, or scenes, be specific (e.g., "Golden Retriever" not just "dog").
4. If you are unsure about something, say so honestly rather than guessing.
5. Structure longer responses with clear formatting for readability.
6. For follow-up questions, reference details from the image and prior conversation context.
7. Be helpful, informative, and professional in your responses.`;

/**
 * Convert a File to the inline data format expected by the Gemini SDK.
 */
async function fileToGenerativePart(file: File) {
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64String = result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64Data,
      mimeType: file.type,
    },
  };
}

/**
 * Analyze an image with the Gemini Vision model.
 *
 * Uses `startChat()` with structured history for proper multi-turn
 * conversation support, so users can ask follow-up questions about
 * the same image with full context.
 */
export async function analyzeImageWithGemini(
  imageFile: File,
  prompt: string,
  conversationHistory: ConversationHistory[] = []
): Promise<string> {
  // Guard: no API key configured
  if (!API_KEY || !genAI) {
    throw new Error(
      'Gemini API key is not configured. Please add your API key to a .env file as VITE_GEMINI_API_KEY.'
    );
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
        topP: 0.95,
        topK: 40,
      },
    });

    // Convert the image file to the format Gemini expects
    const imagePart = await fileToGenerativePart(imageFile);

    // --- First message (no prior history) ---
    if (conversationHistory.length === 0) {
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      return response.text();
    }

    // --- Follow-up messages (multi-turn with history) ---
    // Build the SDK-compatible history array.
    // The first user turn must include the image so the model retains visual context.
    const sdkHistory: { role: string; parts: Part[] }[] = [];

    for (let i = 0; i < conversationHistory.length; i++) {
      const turn = conversationHistory[i];

      if (i === 0 && turn.role === 'user') {
        // First user turn: attach the image alongside the text
        sdkHistory.push({
          role: 'user',
          parts: [{ text: turn.content }, imagePart],
        });
      } else {
        sdkHistory.push({
          role: turn.role,
          parts: [{ text: turn.content }],
        });
      }
    }

    const chat = model.startChat({ history: sdkHistory });
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing image with Gemini:', error);

    // Re-throw with a user-friendly message
    if (error instanceof Error) {
      if (error.message.includes('API key not valid')) {
        throw new Error(
          'Your Gemini API key is invalid. Please check your VITE_GEMINI_API_KEY in the .env file.'
        );
      }
      if (error.message.includes('quota')) {
        throw new Error(
          'API quota exceeded. Please wait a moment and try again, or check your Google AI Studio usage.'
        );
      }
      if (error.message.includes('SAFETY')) {
        throw new Error(
          'The image or prompt was blocked by safety filters. Please try a different image or rephrase your question.'
        );
      }
      // Propagate the original error message for other cases
      throw error;
    }

    throw new Error('An unexpected error occurred while analyzing the image.');
  }
}