import { Component, effect, ElementRef, input, viewChild } from "@angular/core";
import { framework } from "./framework";

@Component({
  selector: "app-preview",
  standalone: true,
  templateUrl: "./preview.component.html",
  styleUrl: "./preview.component.scss",
})
export class PreviewComponent {
  code = input<string>("");
  pointerEvents = input<"auto" | "none">("auto");
  frame = viewChild.required<ElementRef<HTMLIFrameElement>>("frame");

  constructor() {
    effect(() => {
      injectScript(this.frame().nativeElement, framework, this.code());
    });
  }
}

const injectScript = (
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
