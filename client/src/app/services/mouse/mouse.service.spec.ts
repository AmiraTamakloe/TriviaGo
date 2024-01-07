import { TestBed } from '@angular/core/testing';
import { MouseService } from './mouse.service';

describe('MouseService', () => {
    let service: MouseService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MouseService);
    });

    it('should return true when left mouse button is clicked', () => {
        expect(service.leftClickDetect(0)).toBe(true);
    });

    it('should return false when non-left mouse button is clicked', () => {
        expect(service.leftClickDetect(2)).toBe(false);
    });
});
