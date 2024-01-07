import { TestBed } from '@angular/core/testing';

import { GameModeSelectionService } from './game-mode-selection.service';

describe('GameModeSelectionService', () => {
    let service: GameModeSelectionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameModeSelectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
