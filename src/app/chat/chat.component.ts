import { Component, effect, ElementRef, input, output, Signal, viewChild } from "@angular/core";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormsModule } from "@angular/forms";

export interface Message {
  text: Signal<string>;
  timestamp: number;
  sender: "user" | "bot";
}

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrl: "./chat.component.css",
  imports: [MatInputModule, FormsModule, MatFormFieldModule],
  standalone: true,
  providers: [],
})
export class ChatComponent {
  messages = input<Message[]>([]);
  message = output<string>();
  container = viewChild.required<ElementRef<HTMLDivElement>>("container");

  protected prompt = "";

  constructor() {
    effect(() => {
      this.messages();
      this.container().nativeElement.scrollTop =
        this.container().nativeElement.scrollHeight;
    });
  }

  sendMessage() {
    this.message.emit(this.prompt);
    this.prompt = "";
  }
}
