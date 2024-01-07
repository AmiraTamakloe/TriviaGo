import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ConfirmationPopupComponent } from '@app/components/confirmation-popup/confirmation-popup.component';
import { History } from '@app/interfaces/history';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { PaginatorHandlerService } from '@app/services/paginator-handler/paginator-handler.service';
import { NUMBER_OF_GAMES_PER_PAGE } from '@common/constants';

@Component({
    selector: 'app-history-list',
    templateUrl: './history-list.component.html',
    styleUrls: ['./history-list.component.scss'],
})
export class HistoryListComponent implements OnInit {
    @Input() isAdmin: boolean;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    protected history: History[];
    protected gamesHistoryOnPage: History[];
    protected historyLength: number;
    protected isAscendingName: boolean = true;
    protected isAscendingDate: boolean = true;
    protected isAscending = { gameName: true, date: true };
    protected numGamesHistoryOnPage: number = NUMBER_OF_GAMES_PER_PAGE;

    constructor(
        private paginatorHandler: PaginatorHandlerService,
        private gameHistoryService: GameHistoryService,
        private dialog: MatDialog,
    ) {}

    async ngOnInit(): Promise<void> {
        this.history = await this.fetchGameHistory();
        this.historyLength = this.history.length;
        this.gamesHistoryOnPage = this.history.slice(0, this.numGamesHistoryOnPage);
    }

    handlePageChange(event: PageEvent): void {
        this.gamesHistoryOnPage = this.paginatorHandler.handlePageChange(event, this.history) as History[];
    }

    deleteHistory() {
        this.dialog
            .open(ConfirmationPopupComponent)
            .afterClosed()
            .subscribe((result) => {
                if (result) {
                    this.gameHistoryService.removeGameHistory();
                    this.gamesHistoryOnPage = [];
                    this.historyLength = 0;
                }
            });
    }

    gameHistoryOrder(property: 'gameName' | 'date'): void {
        if (this.isAscending[property]) {
            this.history.sort((a, b) => a[property].localeCompare(b[property]));
        } else {
            this.history.sort((a, b) => b[property].localeCompare(a[property]));
        }
        this.isAscending[property] = !this.isAscending[property];
        this.gamesHistoryOnPage = this.history.slice(0, this.numGamesHistoryOnPage);
    }

    private async fetchGameHistory(): Promise<History[]> {
        return new Promise<History[]>((resolve) => {
            this.gameHistoryService.fetchGameHistory().subscribe((res) => {
                resolve(res as History[]);
            });
        });
    }
}
