import { Component, Input, OnDestroy } from '@angular/core';
import { GameModeSelectionService } from '@app/services/game-mode-selection/game-mode-selection.service';
import { PlayersListManagementService } from '@app/services/players-list-management/players-list-management.service';

@Component({
    selector: 'app-player-info',
    templateUrl: './player-info.component.html',
    styleUrls: ['./player-info.component.scss'],
})
export class PlayerInfoComponent implements OnDestroy {
    @Input() playerPoints: number;
    @Input() organizer: boolean;
    selectedGameMode: string;
    protected playerName: string = 'Cedrick';

    constructor(
        private playersListManagementService: PlayersListManagementService,
        private gameModeSelectionService: GameModeSelectionService,
    ) {
        this.gameModeSelectionService.getSelectedMode().subscribe((mode) => {
            this.selectedGameMode = mode;
        });
    }

    get playersNameList(): string[] {
        return this.playersListManagementService.playersList;
    }

    get playersOutNameList(): string[] {
        return this.playersListManagementService.playersOutList;
    }

    get playerPoint() {
        return this.playerPoints;
    }

    get playersPoints() {
        return this.playersListManagementService.playersPointsList;
    }

    get playersOutPoints() {
        return this.playersListManagementService.playersOutPointsList;
    }

    private set playerPoint(newPlayerPoint: number) {
        this.playerPoints = newPlayerPoint;
    }

    ngOnDestroy(): void {
        this.playersListManagementService.endGame();
    }
}
