import {
  Component,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
  WritableSignal,
} from "@angular/core";
import { EditorComponent } from "./editor/editor.component";
import { MatTabsModule } from "@angular/material/tabs";
import { ChatComponent, Message } from "./chat/chat.component";
import { ChatService } from "./chat.service";
import { PreviewComponent } from "./preview/preview.component";
import { SplitComponent, SplitAreaComponent } from "angular-split";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  imports: [
    EditorComponent,
    MatTabsModule,
    ChatComponent,
    PreviewComponent,
    SplitComponent,
    SplitAreaComponent,
  ],
})
export class AppComponent {
  protected messages = signal<Message[]>([]);
  protected code = signal("");
  protected editor = viewChild.required<EditorComponent>(EditorComponent);
  private history: string[] = [];
  protected dragging = false;

  private chatService = inject(ChatService);

  constructor() {
    effect(() => {
      console.log("Code changed", this.code());
    });
  }

  inBrowser() {
    return typeof window !== "undefined";
  }

  protected onDragStart() {
    this.dragging = true;
  }

  protected onDragEnd() {
    this.dragging = false;
  }

  async handleMessage(message: string) {
    this.messages.set([
      ...this.messages(),
      { text: signal(message), sender: "user", timestamp: Date.now() },
    ]);

    this.history.push("User prompt: " + message);
    const response = this.chatService.sendMessage(
      this.history.join("\n####################\n")
    );

    this.messages.set([
      ...this.messages(),
      { text: response.explanation, sender: "bot", timestamp: Date.now() },
    ]);
    this.code = response.code as WritableSignal<string>;
    response.promise.then(() => {
      this.history.push(
        "Bot response" + response.explanation(),
        "Bot code" + response.code()
      );
    });
  }
}
