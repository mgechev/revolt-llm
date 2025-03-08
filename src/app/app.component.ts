import {
  afterNextRender,
  Component,
  inject,
  Signal,
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
  private pastPrompt = "";

  private chatService = inject(ChatService);

  private resetHistory = false;
  readonly settings = getSettings();
  readonly dialog = inject(MatDialog);

  constructor() {
    afterNextRender(() => {
      if (this.settings.apiKey() === '' || this.settings.model() === '') {
        this.openSettingsDialog();
      }
    });
  }

  inBrowser() {
    return typeof window !== "undefined";
  }

  protected openSettingsDialog(): void {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      data: { apiKey: this.settings.apiKey(), model: this.settings.model(), framework: this.settings.framework(), save: this.settings.save() },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }
      if (this.settings.framework() !== result.framework) {
        this.resetHistory = true;
      }
      this.settings.apiKey.set(result.apiKey);
      this.settings.model.set(result.model);
      this.settings.framework.set(result.framework);
      this.settings.save.set(result.save);
      if (this.settings.save()) {
        saveSettings(this.settings);
      } else {
        deleteSettings();
      }
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

    if (this.resetHistory) {
      this.pastPrompt = '';
      this.resetHistory = false;
    }

    const response = this.chatService.sendMessage(
      this.settings.framework(),
      `${this.pastPrompt}\nUser prompt: ${message}`,
      this.settings.model(),
      this.settings.apiKey()
    );

    this.messages.set([
      ...this.messages(),
      { text: response.explanation, sender: "bot", timestamp: Date.now() },
    ]);
    this.code = response.code as WritableSignal<string>;
    response.promise.then(() => {
      this.pastPrompt = `
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

interface Settings {
  apiKey: WritableSignal<string>;
  model: WritableSignal<string>;
  framework: WritableSignal<'revolt'|'react'>;
  save: WritableSignal<boolean>;
}


const saveSettings = (settings: Settings) => {
  const pojoSettings = {
    apiKey: settings.apiKey(),
    model: settings.model(),
    framework: settings.framework(),
    save: settings.save()
  };
  localStorage.setItem('settings', JSON.stringify(pojoSettings));
};

const getSettings = (): Settings => {
  if (typeof localStorage !== 'undefined') {
    const settingsString = localStorage.getItem('settings');
    if (settingsString) {
      const object = JSON.parse(settingsString);
      return {
        apiKey: signal(object.apiKey),
        model: signal(object.model),
        framework: signal(object.framework),
        save: signal(object.save)
      } as Settings;
    }
  }
  return {
    apiKey: signal(''),
    model: signal(''),
    framework: signal('revolt'),
    save: signal(false)
  };
};

const deleteSettings = () => {
  localStorage.removeItem('settings');
};
