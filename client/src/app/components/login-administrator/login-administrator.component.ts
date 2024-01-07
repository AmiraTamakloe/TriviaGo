import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'app-login-administrator',
    templateUrl: './login-administrator.component.html',
    styleUrls: ['./login-administrator.component.scss'],
    imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule],
    standalone: true,
})
export class LoginAdministratorComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: { code: string; name: string }) {}

    onEnter(): void {
        const okButton = document.getElementById('okButton') as HTMLButtonElement;
        okButton.click();
    }
}
