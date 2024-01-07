/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import JoinMatchService from './join-match.service';
import { of } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('JoinMatchService', () => {
    let service: JoinMatchService;
    let mockDialog: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

        TestBed.configureTestingModule({
            providers: [{ provide: MatDialog, useValue: mockDialog }, MatSnackBar],
            imports: [MatDialogModule, MatSnackBarModule, BrowserAnimationsModule],
        });
        service = TestBed.inject(JoinMatchService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should open a dialog', () => {
        const code = '123';
        const name = 'John';
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRefSpy.afterClosed.and.returnValue(of({ code, name }));
        mockDialog.open.and.returnValue(dialogRefSpy);
        spyOn(service.socketClientService, 'send');
        spyOn(service['popupService'], 'openPopup');
        service.openDialog(code, name);
        expect(service.dialog.open).toHaveBeenCalled();
        expect(service.socketClientService.send).toHaveBeenCalledWith('attemptJoinMatch', { code, name });
    });

    it('should open a popup if fields are empty', () => {
        const code = undefined;
        const name = undefined;

        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRefSpy.afterClosed.and.returnValue(of({ code, name }));
        mockDialog.open.and.returnValue(dialogRefSpy);
        spyOn(service['popupService'], 'openPopup');
        service.openDialog(code, name);
        expect(service['popupService'].openPopup).toHaveBeenCalled();
    });
});
