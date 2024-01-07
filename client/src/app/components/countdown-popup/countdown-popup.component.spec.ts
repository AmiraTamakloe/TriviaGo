/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { TimeService } from '@app/services/time/time.service';
import { of } from 'rxjs';
import { CountdownPopupComponent } from './countdown-popup.component';

describe('CountdownPopupComponent', () => {
    let component: CountdownPopupComponent;
    let fixture: ComponentFixture<CountdownPopupComponent>;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;
    let dialogSpy: jasmine.SpyObj<MatDialogRef<CountdownPopupComponent>>;
    let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
    const dialogRefMock = {
        close: jasmine.createSpy('close'),
    };
    let socketClientService: SocketTestHelper;

    beforeEach(() => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer']);
        dialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['queryParams'], {
            queryParams: of({ organizer: 'true' }),
        });
        TestBed.configureTestingModule({
            declarations: [CountdownPopupComponent],
            imports: [MatDialogModule, MatSnackBarModule, RouterModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { message: 'test message' } },
                { provide: MatDialogRef, useValue: { dialogRefMock } },
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: MatDialogRef, useValue: dialogSpy },
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
                { provide: SocketClientService, useClass: SocketTestHelper },
                MatDialog,
                MatSnackBar,
            ],
        });
        fixture = TestBed.createComponent(CountdownPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        socketClientService = TestBed.inject(SocketClientService) as unknown as SocketTestHelper;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close popup on timeIsUp event', async () => {
        component.ngOnInit();
        socketClientService.peerSideEmit('timeIsUp');
        expect(dialogSpy.close).toHaveBeenCalled();
    });

    it('should call removeAllListeners  method with correct argument when ngOnDestroy is called', () => {
        const spy = spyOn(socketClientService, 'removeAllListeners');
        component.ngOnDestroy();
        expect(spy).toHaveBeenCalled();
    });
});
