import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  input,
  output,
  Signal,
  viewChild,
} from "@angular/core";
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
  styleUrl: "./chat.component.scss",
  imports: [MatInputModule, FormsModule, MatFormFieldModule],
  standalone: true,
})
export class ChatComponent {
  messages = input<Message[]>([]);
  message = output<string>();
  container = viewChild.required<ElementRef<HTMLDivElement>>("container");

  protected prompt = "";

  constructor() {
    afterNextRender(() => {
      if (typeof window === 'undefined') {
        return;
      }
      const ro = new MutationObserver(() => {
        this.container().nativeElement.scrollTop =
          this.container().nativeElement.scrollHeight;
      });
      ro.observe(this.container().nativeElement, {
        subtree: true,
        childList: true,
        characterData: true
      });
    });
  }

  sendMessage() {
    this.message.emit(this.prompt.trim());
    this.prompt = "";
  }
}
