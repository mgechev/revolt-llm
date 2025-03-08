import { Component, effect, ElementRef, input, viewChild } from "@angular/core";
import { revolt } from "./revolt";

@Component({
  selector: "app-preview",
  standalone: true,
  templateUrl: "./preview.component.html",
  styleUrl: "./preview.component.scss",
})
export class PreviewComponent {
  code = input<string>("");
  framework = input.required<'react'|'revolt'>();
  pointerEvents = input<"auto" | "none">("auto");
  frame = viewChild.required<ElementRef<HTMLIFrameElement>>("frame");

  constructor() {
    effect(() => {
      if (this.framework() === 'revolt') {
        runRevoltApp(this.frame().nativeElement, revolt, this.code());
      } else {
        runReactApp(this.frame().nativeElement, this.code());
      }
    });
  }
}

const runReactApp = (
  frame: HTMLIFrameElement,
  code: string
) => {
  if (typeof window === "undefined") {
    return;
  }

  frame.onload = () => {
    if (!frame.contentDocument || !frame.contentDocument.body) {
      console.error("Iframe not loaded or body not available.");
      return;
    }

    while (frame.contentDocument.body.firstChild) {
      frame.contentDocument.body.firstChild.remove();
    }

    const appContainer = frame.contentDocument.createElement('div');
    appContainer.id = 'root';

    const reactScript = frame.contentDocument.createElement("script");
    reactScript.src = 'https://unpkg.com/react@17/umd/react.development.js';
    reactScript.defer = true;

    const reactDOMScript = frame.contentDocument.createElement("script");
    reactDOMScript.src = 'https://unpkg.com/react-dom@17/umd/react-dom.development.js';
    reactDOMScript.defer = true;

    const babelScript = frame.contentDocument.createElement("script");
    babelScript.src = 'https://unpkg.com/@babel/standalone@7.23.7/babel.min.js';
    babelScript.defer = true;

    const appScript = frame.contentDocument.createElement("script");
    appScript.text = `
      (function(){
        ${code}
      })();
    `;
    appScript.defer = true;

    frame.contentDocument.body.appendChild(appContainer);
    frame.contentDocument.body.appendChild(reactScript);
    frame.contentDocument.body.appendChild(babelScript);
    
    reactScript.onload = () => {
      frame.contentDocument!.body.appendChild(reactDOMScript);
    };

    reactDOMScript.onload = () => {
      frame.contentDocument!.body.appendChild(appScript);
    };

    reactScript.onerror = (error) => {
      console.error("React script injection failed:", error);
    };
    reactDOMScript.onerror = (error) => {
      console.error("ReactDOM script injection failed:", error);
    };
    appScript.onerror = (error) => {
      console.error("App script injection failed:", error);
    };
  };

  if (
    frame.contentDocument &&
    frame.contentDocument.readyState === "complete"
  ) {
    (frame as any).onload();
  }
};

const runRevoltApp = (
  frame: HTMLIFrameElement,
  framework: string,
  code: string,
) => {
  code = framework + "\n" + code;

  if (typeof window === "undefined") {
    return;
  }

  // 1. Wait for the iframe content to load:
  frame.onload = () => {
    // Or frame.addEventListener('load', () => { ... });
    if (!frame.contentDocument || !frame.contentDocument.body) {
      console.error("Iframe not loaded or body not available.");
      return;
    }

    const script = frame.contentDocument.createElement("script");
    script.text = code;
    script.type = "module";

    while (frame.contentDocument.body.firstChild) {
      frame.contentDocument.body.firstChild.remove();
    }
    frame.contentDocument.body.appendChild(script);

    script.onerror = (error) => {
      console.error("Script injection failed:", error);
    };
  };

  // Handle cases where the iframe might already be loaded.
  if (
    frame.contentDocument &&
    frame.contentDocument.readyState === "complete"
  ) {
    (frame as any).onload(); // Call the onload handler immediately.
  }
};
