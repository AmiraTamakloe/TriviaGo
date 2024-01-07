/* eslint-disable max-params */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationPopupComponent } from '@app/components/confirmation-popup/confirmation-popup.component';
import { QuestionListComponent } from '@app/components/question-list/question-list.component';
import { Game } from '@app/interfaces/game';
import { DownloadGameJsonFileService } from '@app/services/download-game-json-file/download-game-json-file.service';
import { GameService } from '@app/services/game/game.service';
import { MatchManagementService } from '@app/services/match-management/match-management.service';
import { ModificationGameService } from '@app/services/modification-game/modification-game.service';
import { PopupService } from '@app/services/popup/popup.service';
import { VISIBLE_POPUP_DURATION } from '@common/constants';
@Component({
    selector: 'app-game-details',
    templateUrl: './game-details.component.html',
    styleUrls: ['./game-details.component.scss'],
})
export class GameDetailsComponent {
    @Input() isAdmin: boolean;
    @Input() game: Game;
    @Input() index: number;
    @Output() updateView = new EventEmitter<void>();
    @Output() updateGameList = new EventEmitter<number>();
    protected isSelected: boolean = false;
    protected icon: string = 'expand_more';
    private tempGame: Game | undefined;

    constructor(
        private dialog: MatDialog,
        protected router: Router,
        private gameService: GameService,
        protected downloadGameJsonFileService: DownloadGameJsonFileService,
        private popupService: PopupService,
        private modificationGameService: ModificationGameService,
        private matchManagementService: MatchManagementService,
    ) {}

    displayDetails() {
        this.isSelected = !this.isSelected;
        this.icon = this.icon === 'expand_more' ? 'expand_less' : 'expand_more';
    }

    displayQuestions() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        this.dialog.open(QuestionListComponent, { data: { questions: this.game?.questions, dialogConfig }, panelClass: 'scrollable-dialog' });
    }

    async startTestingGame(): Promise<void> {
        const isAvailable: boolean = await this.checkIfGameIsAvailable();
        if (isAvailable) {
            this.matchManagementService.createTestMatch(this.game.id);
        } else {
            this.updateView.emit();
        }
    }

    async createMatch(): Promise<void> {
        const isAvailable: boolean = await this.checkIfGameIsAvailable();
        if (isAvailable) {
            this.matchManagementService.createMatch(this.game.id);
        } else {
            this.updateView.emit();
        }
    }
    async changeVisibility() {
        this.game.visible = !this.game.visible;
        this.gameService.patchGameVisibility(this.game.id).subscribe();
        if (this.game.visible) {
            this.popupService.openPopup('Le jeu est visible', VISIBLE_POPUP_DURATION);
        } else {
            this.popupService.openPopup('Le jeu est invisible', VISIBLE_POPUP_DURATION);
        }
    }

    deleteGame(id: string): void {
        if (id !== undefined) {
            const dialogRef = this.dialog.open(ConfirmationPopupComponent);
            dialogRef.afterClosed().subscribe((result) => {
                if (result) {
                    this.gameService.removeGame(id);
                    window.alert(this.game.title + ' supprimé');
                    this.updateGameList.emit(this.index);
                }
            });
        }
    }

    exportGame(game: Game) {
        this.downloadGameJsonFileService.download(game);
    }

    modifGame(id: string) {
        this.modificationGameService.isDiff = true;
        this.router.navigate(['modification/' + id]);
    }

    private async checkIfGameIsAvailable(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.gameService.fetchGameById(this.game.id).subscribe((res) => {
                this.tempGame = res as Game;
                if (this.tempGame) {
                    resolve(this.tempGame.visible);
                } else {
                    resolve(false);
                }
            });
        });
    }
}
