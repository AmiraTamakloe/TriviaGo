import { TestBed } from '@angular/core/testing';
import { Game } from '@app/interfaces/game';
import { DownloadGameJsonFileService, GameWithoutVisibleAttribute } from './download-game-json-file.service';
import { saveAs } from 'file-saver';

const gameWithoutVisibleAttribute: GameWithoutVisibleAttribute = {
    title: 'A',
    id: 'A',
    duration: 0,
    questions: [],
    $schema: 'schema',
    description: 'description',
    lastModification: 'yesterday',
};
const game: Game = { ...gameWithoutVisibleAttribute, visible: false };

describe('DownloadGameJsonFileService', () => {
    let service: DownloadGameJsonFileService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DownloadGameJsonFileService],
        });
        service = TestBed.inject(DownloadGameJsonFileService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should remove the visible attribute from the result', () => {
        const result = service.copyWithoutVisibleAttribute(game);
        expect(result).toEqual(gameWithoutVisibleAttribute);
    });
    it('should download the game', () => {
        spyOn(saveAs, 'saveAs');
        service.download(game);
        expect(saveAs).toHaveBeenCalled();
    });
});
