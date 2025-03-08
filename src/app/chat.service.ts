import { Injectable, signal, WritableSignal, Signal } from "@angular/core";
import { SAXParser } from 'sax';

export interface ResponseConfig {
  explanation: WritableSignal<string>;
  code: WritableSignal<string>;
  explanationOver: boolean;
}

@Injectable({
  providedIn: "root",
})
export class ChatService {
  sendMessage(framework: string, message: string, model: string, apiKey: string): {
    code: Signal<string>;
    explanation: Signal<string>;
    promise: Promise<void>;
  } {
    const parser = streamingParser();

    const promise = new Promise<void>((resolve) => {
      fetch("/api/v1/prompt", {
        method: "POST",
        body: JSON.stringify({ prompt: message, model, apiKey, framework }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (response) => {
        const reader = response.body!.getReader();

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          const valueString = new TextDecoder().decode(value);
          parser.write(valueString);
        }
        parser.code.set(stripMarkdown(parser.code()));
        resolve();
      });
    });

    return { code: parser.code, explanation: parser.explanation, promise };
  }
}

const stripMarkdown = (str: string) => {
  return str.replace('```javascript', '').replace('```', '');
};

enum ParsingStage {
  Code,
  Explanation,
  None,
}

const TagParseStage = {
  "<revolt-explanation>": ParsingStage.Explanation,
  "<revolt-code>": ParsingStage.Code,
};

const tags = [
  "<revolt-response>",
  "<revolt-explanation>",
  "<revolt-code>",
  "</revolt-response>",
  "</revolt-explanation>",
  "</revolt-code>",
];

const getPrefixTag = (str: string) => {
  for (const tag of tags) {
    if (str.startsWith(tag)) {
      return tag;
    }
  }
  return undefined;
};

const completeTag = (str: string) => {
  if (str[0] !== "<") {
    return false;
  }
  for (let i = 0; i < str.length; i++) {
    if (str[i] === ">") {
      return true;
    }
  }
  return false;
};

const couldBeSystemTag = (str: string) => {
  for (const tag of tags) {
    for (let i = 3; i < str.length; i++) {
      if (str.startsWith(tag.substring(0, i))) {
        return true;
      }
    }
  }
  return false;
};

export const streamingParser = () => {
  const code = signal("");
  const explanation = signal("");
  let stage = ParsingStage.None;
  let idx = 0;
  let entireText = "";

  const longestTag = "</revolt-explanation>".length;

  const write = (text: string) => {
    entireText += text;
    let wait = false;
    for (let i = idx; i < entireText.length && !wait; i++) {
      if (entireText[i] === "<") {
        const subStr = entireText.slice(i, i + longestTag);
        const tag = getPrefixTag(subStr);
        if (tag && tag.startsWith("</")) {
          if (tag === "</revolt-code>" || tag === "</revolt-response>") {
            stage = ParsingStage.None;
            wait = true;
            i = entireText.length;
            idx = i;
          } else if (tag === "</revolt-explanation>") {
            // Set it to be right at the closing >
            i += longestTag - 1;
            // Moving it to be the next character
            idx = i + 1;
            continue;
          } else {
            // We still haven't read the entire tag
            // We return one counter back and wait for the next
            // time we flush data.
            i--;
            idx = i;
            wait = true;
            continue;
          }
        } else if (tag) {
          // It's opening tag here
          stage = (TagParseStage as any)[tag] ?? ParsingStage.None;
          i = entireText.indexOf(tag) + tag.length - 1;
          idx = i + 1;
          continue;
        } else if (!completeTag(subStr)) {
          // We haven't found a tag yet
          // We don't change state and just reduce the counter
          // waiting for data.
          // not incrementing i because we're pausing and starting from idx
          idx = i;
          wait = true;
          continue;
        }
        // The alternative is some XML in the code
      }
      let start = i;
      let potentiallyFoundTag = false;
      while (i < entireText.length && !potentiallyFoundTag) {
        const couldBeTag = '<' === entireText[i];
        const prefixTag = getPrefixTag(entireText.substring(start, i))
        if (couldBeTag && (couldBeSystemTag(entireText.substring(i, entireText.length)) || prefixTag)) {
          potentiallyFoundTag = true;
          i--;
        } else {
          i++;
        }
      }
      if (stage === ParsingStage.Explanation) {
        explanation.set(explanation() + entireText.slice(start, i + 1));
      }
      if (stage === ParsingStage.Code) {
        code.set(code() + entireText.slice(start, i + 1));
      }
      idx = i;
    }
  };

  return {
    code,
    explanation,
    write,
  };
};

const entityCharMap: Record<string, string> = {
  '&quot;': '"',
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
};

const replaceEntities = (str: string) => {
  for (const entity in entityCharMap) {
    str = str.replace(new RegExp(entity, 'g'), entityCharMap[entity]);
  }
  return str;
};