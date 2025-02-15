import {ChangeDetectionStrategy, Component, inject, model, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';

export interface DialogData {
  apiKey: string;
  model: string;
}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'settings.component.html',
  styleUrl: 'settings.component.scss',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatSelectModule
  ],
})
export class SettingsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<SettingsDialogComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly apiKey = model(this.data.apiKey);
  readonly model = model(this.data.model);

  onNoClick(): void {
    this.dialogRef.close();
  }
}