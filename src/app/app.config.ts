import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { NgxMonacoEditorConfig, provideMonacoEditor } from 'ngx-monaco-editor-v2';

const monacoConfig: NgxMonacoEditorConfig = {
  // You can pass cdn url here instead
  defaultOptions: { scrollBeyondLastLine: false },
  baseUrl: window.location.origin + "/assets/monaco/min/vs"
};

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideMonacoEditor(monacoConfig), provideAnimations()]
};
