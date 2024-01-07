import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FileUploaderComponent } from '@app/components/file-uploader/file-uploader.component';
import { Game } from '@app/interfaces/game';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    @Input() isAdmin: boolean;
    @Input() game: Game;
    constructor(public dialog: MatDialog) {}

    displayImport() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        this.dialog.open(FileUploaderComponent);
    }
}
