import OpenAI from "openai";
import { OPENAI_API_KEY } from "./secrets";

const openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * @param prompt User-generated suffix prompt
 * @returns base64 file data
 */
export async function generateImage(prompt: string) {
  const image = await openaiClient.images.generate({
    model: "dall-e-3",
    response_format: "b64_json",
    prompt: `You are a skilled UX designer. Stakeholders in a project are generating ideas, and your job is to help them communicate their ideas visually. You will draw a wireframe that shows their idea in the form of a user interface. The user interface you draw might directly represent their idea, or it might be the user interface that would be needed to support their idea. -- Your wireframes should be a simple as possible, highlighting only the key elements to understand the idea, and leaving out anything else. They should be in grayscale. They should be in widescreen format with a proportion of 2:1. -- The stakeholder's idea is: ${prompt}`,
  });

  return image.data[0].b64_json;
}

export default openaiClient;
