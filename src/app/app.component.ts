import {
  afterNextRender,
  Component,
  inject,
  signal,
  WritableSignal,
} from "@angular/core";
import { EditorComponent } from "./editor/editor.component";
import { MatTabsModule } from "@angular/material/tabs";
import { ChatComponent, Message } from "./chat/chat.component";
import { ChatService } from "./chat.service";
import { PreviewComponent } from "./preview/preview.component";
import { SplitComponent, SplitAreaComponent } from "angular-split";
import { MatButtonModule } from "@angular/material/button";
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDialog } from "@angular/material/dialog";
import { SettingsDialogComponent } from "./settings/settings.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  standalone: true,
  imports: [
    EditorComponent,
    MatTabsModule,
    ChatComponent,
    PreviewComponent,
    SplitComponent,
    SplitAreaComponent,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
  ],
  host: {
    ngSkipHydration: "true",
  },
})
export class AppComponent {
  protected messages = signal<Message[]>([]);
  protected code = signal("");
  protected dragging = false;
  private nextPrompt = "";

  private chatService = inject(ChatService);

  readonly apiKey = signal("");
  readonly model = signal("");
  readonly framework = signal<'revolt'|'react'>("revolt");
  readonly dialog = inject(MatDialog);

  constructor() {
    afterNextRender(() => {
      if (this.apiKey() === '' || this.model() === '') {
        this.openSettingsDialog();
      }
    });
  }

  inBrowser() {
    return typeof window !== "undefined";
  }

  protected openSettingsDialog(): void {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      data: { apiKey: this.apiKey(), model: this.model(), framework: this.framework() },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }
      this.apiKey.set(result.apiKey);
      this.model.set(result.model);
      this.framework.set(result.framework);
    });
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

    const response = this.chatService.sendMessage(
      this.framework(),
      `${this.nextPrompt}\nUser prompt: ${message}`,
      this.model(),
      this.apiKey()
    );

    this.messages.set([
      ...this.messages(),
      { text: response.explanation, sender: "bot", timestamp: Date.now() },
    ]);
    this.code = response.code as WritableSignal<string>;
    response.promise.then(() => {
      this.nextPrompt = `
Previous user prompt and response:
User prompt: ${message}
<revolt-response>
<revolt-explanation>
  ${response.explanation()}
</revolt-explanation>
<revolt-code>
${response.code()}
</revolt-code>
</revolt-response>
`;
    });
  }
}
