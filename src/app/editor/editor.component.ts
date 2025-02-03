import { Component, effect, ElementRef, input, model, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as monaco from 'monaco-editor';
import { EditorComponent as MonacoEditorComponent } from 'ngx-monaco-editor-v2';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
  standalone: true,
  imports: [MonacoEditorComponent, FormsModule],
})
export class EditorComponent {
  options = {
    theme: 'vs-dark',
    language: 'javascript'
  };
  code = model<string>('')

  constructor() {
    effect(() => {
      console.log(this.code())
    });
  }
}
