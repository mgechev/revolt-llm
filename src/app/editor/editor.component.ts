import { Component, model, output, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { EditorComponent as MonacoEditorComponent } from "ngx-monaco-editor-v2";

@Component({
  selector: "app-editor",
  templateUrl: "./editor.component.html",
  styleUrl: "./editor.component.scss",
  standalone: true,
  imports: [MonacoEditorComponent, FormsModule],
})
export class EditorComponent {
  options = {
    theme: "vs-light",
    language: "javascript",
    automaticLayout: true,
    fontSize: 14
  };
  code = model<string>("");
  codeUpdate = output<string>();
  editor = viewChild.required<MonacoEditorComponent>(MonacoEditorComponent);

  codeChanged() {
    this.codeUpdate.emit(this.code());
  }
}
