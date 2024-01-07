/* eslint-disable max-params */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { CountdownPopupComponent } from '@app/components/countdown-popup/countdown-popup.component';
import { MatchManagementService } from '@app/services/match-management/match-management.service';
import { PlayersListManagementService } from '@app/services/players-list-management/players-list-management.service';
import { PopupService } from '@app/services/popup/popup.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { ANIMATION_DURATION, POPUP_DURATION } from '@common/constants';

@Component({
    selector: 'app-waiting-screen-page',
    templateUrl: './waiting-screen-page.component.html',
    styleUrls: ['./waiting-screen-page.component.scss'],
})
export class WaitingScreenPageComponent implements OnInit, OnDestroy {
    players: string[] = [];
    protected matchId: string;
    protected animatedText = '.';
    protected lockMatchText = 'Vérouiller la partie';
    protected isOrganizer: boolean;
    private isLocked = false;
    private animationTimer: ReturnType<typeof setInterval> | null = null;

    constructor(
        private playersListManagementService: PlayersListManagementService,
        private matchManagementService: MatchManagementService,
        private route: ActivatedRoute,
        public dialog: MatDialog,
        private popupService: PopupService,
        public socketClientService: SocketClientService,
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            this.isOrganizer = params['organizer'] === 'true';
        });
        this.matchManagementService.init();
        this.playersListManagementService.init();
        this.matchId = this.matchManagementService.matchId;
        this.startTextAnimation();
        this.socketClientService.on('matchAboutToStart', () => {
            this.displayCountdownPopup();
        });
        this.socketClientService.on('updatedWaitRoomPlayersList', (players: string[]) => {
            this.players = players;
        });
        this.socketClientService.send('waitRoomPageInitialized');
    }

    startTextAnimation() {
        const textVariations = ['.', '..', '...'];
        let currentIndex = 0;

        this.animationTimer = setInterval(() => {
            this.animatedText = textVariations[currentIndex];
            currentIndex += 1;
            currentIndex %= textVariations.length;
        }, ANIMATION_DURATION);
    }

    ngOnDestroy(): void {
        if (this.animationTimer !== null) {
            clearInterval(this.animationTimer);
        }

        this.socketClientService.removeAllListeners('matchAboutToStart');
        this.socketClientService.removeAllListeners('updatedWaitRoomPlayersList');
        this.socketClientService.removeAllListeners('exitWaitRoom');
        this.socketClientService.removeAllListeners('reinitializeSocketListeners');
        this.socketClientService.removeAllListeners('changeLockState');
    }

    async startMultiplayerGame(): Promise<void> {
        if (this.players.length < 1) {
            this.popupService.openPopup('Il faut au moins un joueur', POPUP_DURATION);
        } else if (!this.isLocked) {
            this.popupService.openPopup('Il faut vérouiller la salle avant de commencer une partie', POPUP_DURATION);
        } else {
            this.socketClientService.send('matchAboutToStart');
        }
    }

    handleLockMatch() {
        if (this.isLocked) {
            this.lockMatchText = 'Vérouiller la partie';
            this.isLocked = false;
        } else {
            this.lockMatchText = 'Dévérouiller la partie';
            this.isLocked = true;
        }
        this.socketClientService.send('changeLockState', this.isLocked);
    }

    exitWaitRoom() {
        this.matchManagementService.exitMatch();
    }

    banPlayer(index: number) {
        const bannedPlayer = this.players[index];
        this.socketClientService.send('banPlayer', bannedPlayer);
    }

    private displayCountdownPopup() {
        new MatDialogConfig().autoFocus = true;
        const dialogRef = this.dialog.open(CountdownPopupComponent);
        dialogRef.afterClosed().subscribe(() => {
            this.matchManagementService.startMatch();
        });
    }
}
