import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { PasswordAdministatorComponent } from '@app/components/password-administator/password-administator.component';
import { AuthGuardService } from '@app/services/auth-guard/auth-guard.service';
import { MatchManagementService } from '@app/services/match-management/match-management.service';
import { of } from 'rxjs';
import { MainPageComponent } from './main-page.component';
import JoinMatchService from '@app/services/join-match/join-match.service';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let mockDialog: jasmine.SpyObj<MatDialog>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockAuthGuardService: jasmine.SpyObj<AuthGuardService>;

    let matchManagementServiceSpy: jasmine.SpyObj<MatchManagementService>;
    let joinMatchServiceSpy: jasmine.SpyObj<JoinMatchService>;

    beforeEach(() => {
        matchManagementServiceSpy = jasmine.createSpyObj('MatchManagementService', ['init']);
        joinMatchServiceSpy = jasmine.createSpyObj('JoinMatchService', ['openDialog']);
        mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockAuthGuardService = jasmine.createSpyObj('AuthGuardService', ['setPassword', 'isAuthorized']);

        TestBed.configureTestingModule({
            declarations: [MainPageComponent],
            providers: [
                MatSnackBar,
                { provide: MatDialog, useValue: mockDialog },
                { provide: Router, useValue: mockRouter },
                { provide: AuthGuardService, useValue: mockAuthGuardService },
                { provide: MatchManagementService, useValue: matchManagementServiceSpy },
                { provide: JoinMatchService, useValue: joinMatchServiceSpy },
            ],
            imports: [MatSnackBarModule],
        });

        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open a dialog and set the password', () => {
        const password = 'test1';
        const message = 'ceci est un message';
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(password) });
        mockDialog.open.and.returnValue(dialogRefSpyObj);
        mockAuthGuardService.isAuthorized.and.returnValue(true);
        component.openDialog(message);
        expect(mockDialog.open).toHaveBeenCalledWith(PasswordAdministatorComponent, { data: { password: undefined, message } });
        expect(mockAuthGuardService.setPassword).toHaveBeenCalledWith(password);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['admin']);
    });

    it('should open a dialog with an error message if the result is not empty', () => {
        const errorMessage = 'Le mot de passe est invalide';
        const openDialogSpy = spyOn(component, 'openDialog');
        component['checkEmptyPassword']('test');
        expect(openDialogSpy).toHaveBeenCalledWith(errorMessage);
    });

    it('should not open a dialog if the result is empty', () => {
        const openDialogSpy = spyOn(component, 'openDialog');
        component['checkEmptyPassword']('');
        expect(openDialogSpy).not.toHaveBeenCalled();
    });

    it('should do nothing if no result is provided', () => {
        const dialogRefSpy = jasmine.createSpyObj({ afterClosed: of(undefined) });
        mockDialog.open.and.returnValue(dialogRefSpy);
        component.openDialog();
        expect(mockDialog.open).toHaveBeenCalledWith(PasswordAdministatorComponent, { data: Object({ password: undefined, message: undefined }) });
    });

    it('should init', () => {
        expect(matchManagementServiceSpy.init).toHaveBeenCalled();
    });

    it('should call openDialogJoin', () => {
        component.openDialogJoin('allo', 'cedrick');
        expect(joinMatchServiceSpy.openDialog).toHaveBeenCalledWith('allo', 'cedrick');
    });
});
