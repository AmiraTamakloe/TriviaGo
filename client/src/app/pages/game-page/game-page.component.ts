import { Component, OnInit } from '@angular/core';
import { GameModeSelectionService } from '@app/services/game-mode-selection/game-mode-selection.service';
import { HistogramInfoService } from '@app/services/histogram-info/histogram-info.service';
@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    selectedGameMode: string;
    isGameOver = false;
    constructor(
        private gameModeSelectionService: GameModeSelectionService,
        private histogrameInfoService: HistogramInfoService,
    ) {
        this.histogrameInfoService.init();
    }

    ngOnInit(): void {
        this.gameModeSelectionService.getSelectedMode().subscribe((mode) => {
            this.selectedGameMode = mode;
        });
    }
}
