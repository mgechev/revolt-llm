import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
// Send a post fetch request with a JSON { prompt } body
  async sendMessage(message: string): Promise<{ result: string }> {
    return await fetch('/api/v1/prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: message })
    }).then(res => res.json());
  }
}