/* eslint-disable max-params */
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { TimerService } from '@app/services/timer/timer.service';
@Component({
    selector: 'app-countdown-popup',
    templateUrl: './countdown-popup.component.html',
    styleUrls: ['./countdown-popup.component.scss'],
})
export class CountdownPopupComponent implements OnInit, OnDestroy {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { message: string },
        private dialogRef: MatDialogRef<CountdownPopupComponent>,
        private socketClientService: SocketClientService,
        readonly timer: TimerService,
    ) {}

    async ngOnInit(): Promise<void> {
        this.socketClientService.on('timeIsUp', () => {
            this.closePopup();
        });
    }

    ngOnDestroy(): void {
        this.socketClientService.removeAllListeners('timeIsUp');
    }

    private closePopup() {
        this.dialogRef.close();
    }
}
