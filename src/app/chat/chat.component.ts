import { Component, effect, input, output, signal, Signal } from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';

export interface Message {
  text: string;
  timestamp: number;
  sender: 'user'|'bot';
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  imports: [MatInputModule, FormsModule, MatFormFieldModule],
  standalone: true,
  providers: []
})
export class ChatComponent {
  messages = input<Message[]>([]);
  message = output<string>();

  protected prompt = '';

  constructor() {
    effect(() => {
      console.log(this.messages());
    });
  }

  sendMessage() {
    this.message.emit(this.prompt);
    this.prompt = '';
  }
}
