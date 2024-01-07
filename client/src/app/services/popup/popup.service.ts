import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root',
})
export class PopupService {
    constructor(private snackBar: MatSnackBar) {}

    openPopup(message: string, time: number) {
        this.snackBar.open(message, 'Close', {
            duration: time,
        });
    }

    closePopup() {
        if (this.snackBar) {
            this.snackBar.dismiss();
        }
    }
}
