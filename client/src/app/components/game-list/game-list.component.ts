import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { CountdownPopupComponent } from '@app/components/countdown-popup/countdown-popup.component';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game/game.service';
import { PaginatorHandlerService } from '@app/services/paginator-handler/paginator-handler.service';
import { NUMBER_OF_GAMES_PER_PAGE } from '@common/constants';

@Component({
    selector: 'app-game-list',
    templateUrl: './game-list.component.html',
    styleUrls: ['./game-list.component.scss'],
})
export class GameListComponent implements OnInit {
    @Input() isAdmin: boolean;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    protected games: Game[];
    protected gamesOnPage: Game[];
    protected totalVisibleGames: number;
    protected numGamesOnPage: number = NUMBER_OF_GAMES_PER_PAGE;

    constructor(
        private paginatorHandler: PaginatorHandlerService,
        private gameService: GameService,
        private dialog: MatDialog,
    ) {}

    async ngOnInit(): Promise<void> {
        this.games = await this.fetchGamesFromDB();
        this.totalVisibleGames = this.games.length;
        this.gamesOnPage = this.games.slice(0, this.numGamesOnPage);
    }

    handlePageChange(event: PageEvent): void {
        this.gamesOnPage = this.paginatorHandler.handlePageChange(event, this.games) as Game[];
    }

    handleDelete(idx: number) {
        this.games.splice(idx, 1);
        this.totalVisibleGames = this.games.length;
        this.gamesOnPage = this.games.slice(0, this.numGamesOnPage);
    }

    async handleViewUpdate(): Promise<void> {
        this.games = await this.fetchGamesFromDB();
        this.totalVisibleGames = this.games.length;
        this.gamesOnPage = this.games.slice(0, this.numGamesOnPage);
        this.displayPopup();
    }

    private async fetchGamesFromDB(): Promise<Game[]> {
        if (this.isAdmin) {
            return new Promise<Game[]>((resolve) => {
                this.gameService.fetchAllGames().subscribe((res) => {
                    resolve(res as Game[]);
                });
            });
        } else {
            return new Promise<Game[]>((resolve) => {
                this.gameService.fetchVisibleGames().subscribe((res) => {
                    resolve(res as Game[]);
                });
            });
        }
    }

    private displayPopup() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        this.dialog.open(CountdownPopupComponent, {
            data: { message: 'Le jeu est malheureusement indisponible. Veuillez en sélectionner un autre.', dialogConfig },
            panelClass: 'scrollable-dialog',
        });
    }
}
