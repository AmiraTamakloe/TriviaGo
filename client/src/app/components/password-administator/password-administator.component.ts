import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'app-password-administator',
    templateUrl: './password-administator.component.html',
    styleUrls: ['./password-administator.component.scss'],
    imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule],
    standalone: true,
})
export class PasswordAdministatorComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: { password: string; message: string }) {}
    onEnter(): void {
        const okButton = document.getElementById('okButton') as HTMLButtonElement;
        okButton.click();
    }
}
