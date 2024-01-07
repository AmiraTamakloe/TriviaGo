import { saveAs } from 'file-saver';
import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game';
export interface GameWithoutVisibleAttribute extends Omit<Game, 'visible'> {}

@Injectable({
    providedIn: 'root',
})
export class DownloadGameJsonFileService {
    download(game: Game) {
        const gameCopy = this.copyWithoutVisibleAttribute(game);
        const textBlob = new Blob([JSON.stringify(gameCopy, null, 2)], { type: 'text/json' });
        saveAs(textBlob, game.title + '.json');
    }

    copyWithoutVisibleAttribute(game: Game): GameWithoutVisibleAttribute {
        // eslint-disable-next-line no-unused-vars
        const { visible, ...rest } = game;
        return rest;
    }
}
