import { Injectable, signal, WritableSignal, Signal } from "@angular/core";
import { SAXParser } from 'sax';

export interface ResponseConfig {
  explanation: WritableSignal<string>;
  code: WritableSignal<string>;
  explanationOver: boolean;
}

enum ParsingStage {
  Code,
  Explanation,
  None,
}

const entityCharMap: Record<string, string> = {
  '&quot;': '"',
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
};

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

    const promise = new Promise<void>((resolve) => {
      fetch("http://localhost:4200/api/v1/prompt", {
        method: "POST",
        body: JSON.stringify({ prompt: message }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (response) => {
        const reader = response.body!.getReader();
        const parser = new SAXParser();
        let stage = ParsingStage.None;

        parser.onopentag = (tag) => {
          if (tag.name.toLowerCase() === 'explanation') {
            stage = ParsingStage.Explanation;
          } else if (tag.name.toLowerCase() === 'code') {
            stage = ParsingStage.Code;
          }
        };
        
        parser.ontext = text => {
          if (stage === ParsingStage.Explanation) {
            explanation.set(explanation() + text);
          } else if (stage === ParsingStage.Code) {
            code.set(code() + text);
          }
        };

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          const valueString = new TextDecoder().decode(value);
          parser.write(valueString);
          parser.flush();
        }
        parser.close();
        code.set(replaceEntities(code()));
        explanation.set(replaceEntities(explanation()));
        resolve();
      });
    });

    return { code, explanation, promise };
  }
}

const replaceEntities = (str: string) => {
  for (const entity in entityCharMap) {
    str = str.replace(new RegExp(entity, 'g'), entityCharMap[entity]);
  }
  return str;
};