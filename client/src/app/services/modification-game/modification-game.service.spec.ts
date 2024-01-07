import { TestBed } from '@angular/core/testing';
import { ModificationGameService } from './modification-game.service';

describe('ModificationGameService', () => {
    let service: ModificationGameService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ModificationGameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set and get isDiff property', () => {
        expect(service.isDiff).toBeFalse();
        service.isDiff = true;
        expect(service.isDiff).toBeTrue();
        service.isDiff = false;
        expect(service.isDiff).toBeFalse();
    });
});
