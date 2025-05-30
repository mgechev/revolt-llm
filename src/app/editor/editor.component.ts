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
    theme: "vs-dark",
    language: "javascript",
    automaticLayout: true,
    fontSize: 14
  };
  code = model<string>("");
}
