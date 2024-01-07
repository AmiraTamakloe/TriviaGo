import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PopupService } from './popup.service';

describe('PopupService', () => {
    let service: PopupService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatSnackBarModule],
        });
        service = TestBed.inject(PopupService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should open a snackBar with the given message', () => {
        const snackBar = {
            open: jasmine.createSpy('open'),
        };

        const message = 'Test message';
        service.openPopup.call({ snackBar }, message, 0);
        expect(snackBar.open).toHaveBeenCalledWith(message, 'Close', {
            duration: 0,
        });
    });

    it('should dismiss the snackBar if it exists', () => {
        const snackBar = {
            dismiss: jasmine.createSpy('dismiss'),
        };
        service.closePopup.call({ snackBar });

        expect(snackBar.dismiss).toHaveBeenCalled();
    });
});
