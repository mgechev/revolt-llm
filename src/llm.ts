import systemPrompt from "./system-prompt";
import Anthropic from "@anthropic-ai/sdk";

const { GoogleGenerativeAI } = require("@google/generative-ai");

const env = process.env as any;

async function* gemini(prompt: string) {
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContentStream(prompt);

  for await (const chunk of result.stream) {
    yield chunk.text();
  }
}

async function* claude(prompt: string) {
  const client = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
  });

  const stream = new ReadableStream({
    async pull(controller) {
      const anthropicStream = client.messages
        .stream({
          system: systemPrompt,
          model: "claude-3-5-sonnet-latest",
          max_tokens: 8192,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        })
        .on("text", (text) => {
          controller.enqueue(text); // Enqueue the text chunk
        })
        .on("end", () => {
          controller.close(); // Signal the end of the stream
        })
        .on("error", (err) => {
          controller.error(err); // Handle errors
        });

      await new Promise<void>((resolve, reject) => {
        anthropicStream.on("end", resolve);
        anthropicStream.on("error", reject);
      });
    },
  });

  for await (const chunk of stream) {
    yield chunk;
  }
}

const models = {
  gemini,
  claude,
};

export async function* llm(prompt: string) {
  const model = (models as any)[env.MODEL] ?? gemini;
  for await (const chunk of model(prompt)) {
    yield chunk;
  }
}
