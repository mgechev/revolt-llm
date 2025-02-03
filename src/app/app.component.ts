import { afterNextRender, Component, effect, inject, Signal, signal, viewChild } from '@angular/core';
import { EditorComponent } from './editor/editor.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ChatComponent, Message } from './chat/chat.component';
import { ChatService } from './chat.service';
import { PreviewComponent } from './preview/preview.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [EditorComponent, MatTabsModule, ChatComponent, PreviewComponent]
})
export class AppComponent {
  protected messages = signal<Message[]>([]);
  protected code: Signal<string> = signal('var a = 42;');
  protected prompt = '';

  private chatService = inject(ChatService);
  protected editor = viewChild.required<EditorComponent>(EditorComponent);

  constructor() {
    effect(() => {
      console.log('Code changed', this.code());
    });
  }

  inBrowser() {
    return typeof window !== 'undefined';
  }

  async handleMessage(message: string) {
    this.messages.set([...this.messages(), { text: signal(message), sender: 'user', timestamp: Date.now() }]);

    this.prompt += `\nUser prompt: ${message}\n`;
    const response = this.chatService.sendMessage(this.prompt);

    this.messages.set([...this.messages(), { text: response.explanation, sender: 'bot', timestamp: Date.now() }]);
    this.code = response.code;
  }
}
