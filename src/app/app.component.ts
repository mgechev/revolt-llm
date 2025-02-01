import { Component, effect, inject, signal } from '@angular/core';
import { EditorComponent } from './editor/editor.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ChatComponent, Message } from './chat/chat.component';
import { ChatService } from './chat.service';
import { basePrompt } from './base-prompt';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [EditorComponent, MatTabsModule, ChatComponent]
})
export class AppComponent {
  protected messages = signal<Message[]>([]);
  protected prompt = basePrompt;

  private chatService = inject(ChatService);

  constructor() {
    effect(() => {
      console.log(this.messages());
    });
  }

  async handleMessage(message: string) {
    this.messages.set([...this.messages(), { text: message, sender: 'user', timestamp: Date.now() }]);

    this.prompt += `\nUser prompt: ${message}\n`;
    const response = await this.chatService.sendMessage(this.prompt);
    this.prompt += `\nYour response: ${response.result}\n`;
    console.log(this.prompt);
  }
}
