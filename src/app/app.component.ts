import { Component, effect, signal } from '@angular/core';
import { EditorComponent } from './editor/editor.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ChatComponent, Message } from './chat/chat.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [EditorComponent, MatTabsModule, ChatComponent]
})
export class AppComponent {
  protected messages = signal<Message[]>([]);

  constructor() {
    effect(() => {
      console.log(this.messages());
    });
  }

  handleMessage(message: string) {
    this.messages.set([...this.messages(), { text: message, sender: 'user', timestamp: Date.now() }]);
  }
}
