import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginAdministratorComponent } from '@app/components/login-administrator/login-administrator.component';
import { PopupService } from '@app/services/popup/popup.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { POPUP_DURATION } from '@common/constants';

@Injectable({
    providedIn: 'root',
})
export default class JoinMatchService {
    constructor(
        private popupService: PopupService,
        public socketClientService: SocketClientService,
        public dialog: MatDialog,
    ) {}
    openDialog(code?: string | undefined, name?: string | undefined): void {
        this.dialog
            .open(LoginAdministratorComponent, { data: { code, name } })
            .afterClosed()
            .subscribe((data: { code?: string | undefined; name?: string | undefined }) => {
                if (data.code === undefined || data.name === undefined) {
                    this.popupService.openPopup('Les champs ne peuvent pas être vides', POPUP_DURATION);
                } else {
                    this.socketClientService.send('attemptJoinMatch', data);
                }
            });
    }
}
