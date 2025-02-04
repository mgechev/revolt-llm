import { Injectable, signal, WritableSignal, Signal } from "@angular/core";

export interface ResponseConfig {
  explanation: WritableSignal<string>;
  code: WritableSignal<string>;
  explanationOver: boolean;
}

@Injectable({
  providedIn: "root",
})
export class ChatService {
  sendMessage(message: string): {
    code: Signal<string>;
    explanation: Signal<string>;
    promise: Promise<void>;
  } {
    const code = signal("");
    const explanation = signal("");

    let entireText = "";

    const promise = new Promise<void>((resolve) => {
      fetch("http://localhost:4200/api/v1/prompt", {
        method: "POST",
        body: JSON.stringify({ prompt: message }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (response) => {
        const reader = response.body!.getReader();
        let explanationOver = false;
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          const valueString = new TextDecoder().decode(value);
          entireText += valueString;
          if (!explanationOver && valueString.includes("\n")) {
            explanationOver = true;
            const parts = valueString.split("\n");
            explanation.set(explanation() + parts[0]);
            code.set(stripMarkdown(parts.slice(1).join("\n")));
            continue;
          }
          if (!explanationOver) {
            explanation.set(explanation() + valueString);
            continue;
          }
          if (explanationOver) {
            code.set(code() + stripMarkdown(valueString));
            continue;
          }
        }
        resolve();
      });
    });

    return { code, explanation, promise };
  }
}

const suffix = "```javascript";
const stripMarkdown = (text: string) => {
  for (let i = suffix.length - 1; i >= 2; i--) {
    text = text.replace(suffix.substring(0, i + 1), "");
  }
  return text;
};
