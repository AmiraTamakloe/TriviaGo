/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { MatchManagementService } from '@app/services/match-management/match-management.service';
import { PopupService } from '@app/services/popup/popup.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { ANIMATION_DURATION } from '@common/constants';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { WaitingScreenPageComponent } from './waiting-screen-page.component';

class SocketClientServiceMock extends SocketClientService {
    override connect() {}
    override send<T>(event: string, data?: T | undefined, callback?: Function | undefined): void {}
    override removeAllListeners(_event?: string) {}
}

describe('WaitingScreenPageComponent', () => {
    let component: WaitingScreenPageComponent;
    let fixture: ComponentFixture<WaitingScreenPageComponent>;
    let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
    let matchManagementServiceSpy: jasmine.SpyObj<MatchManagementService>;
    let popupServiceSpy: jasmine.SpyObj<PopupService>;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    const mockDialogRef = {
        afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of({})),
    };
    const mockDialog = {
        open: jasmine.createSpy('open').and.returnValue(mockDialogRef),
    };

    beforeEach(() => {
        matchManagementServiceSpy = jasmine.createSpyObj('MatchManagementService', [
            'init',
            'sendMatchAboutToStart',
            'lockPopup',
            'startMatch',
            'exitMatch',
        ]);
        activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['queryParams'], {
            queryParams: of({ organizer: 'true' }),
        });
        popupServiceSpy = jasmine.createSpyObj('PopupService', ['openPopup']);

        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;

        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [WaitingScreenPageComponent],
            providers: [
                { provide: MatchManagementService, useValue: matchManagementServiceSpy },
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
                { provide: PopupService, useValue: popupServiceSpy },
                { provide: MatDialog, useValue: mockDialog },
            ],
        });
        fixture = TestBed.createComponent(WaitingScreenPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call startTextAnimation when ngOnInit is called', () => {
        const spy = spyOn(component, 'startTextAnimation').and.callThrough();
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });

    it('should cycle through text variations', fakeAsync(() => {
        const textVariationsMock = ['.', '..', '...'];

        component.startTextAnimation();

        tick(ANIMATION_DURATION);

        expect(component['animatedText']).toEqual(textVariationsMock[0]);
        tick(ANIMATION_DURATION);
        fixture.detectChanges();

        expect(component['animatedText']).toEqual(textVariationsMock[1]);
        tick(ANIMATION_DURATION);
        fixture.detectChanges();

        expect(component['animatedText']).toEqual(textVariationsMock[2]);
        tick(ANIMATION_DURATION);
        fixture.detectChanges();

        expect(component['animatedText']).toEqual(textVariationsMock[0]);

        if (component['animationTimer'] !== null) {
            clearInterval(component['animationTimer']);
        }
    }));

    it('should handle the list of the players', () => {
        const serverMessage = ['test', 'ced'];
        socketHelper.peerSideEmit('updatedWaitRoomPlayersList', serverMessage);
        expect(component['players']).toBe(serverMessage);
    });

    it('should toggle isLocked and update lockMatchText when handleLockMatch is called', () => {
        expect(component['isLocked']).toBe(false);
        expect(component['lockMatchText']).toBe('Vérouiller la partie');

        component.handleLockMatch();

        expect(component['isLocked']).toBe(true);
        expect(component['lockMatchText']).toBe('Dévérouiller la partie');

        component.handleLockMatch();

        expect(component['isLocked']).toBe(false);
        expect(component['lockMatchText']).toBe('Vérouiller la partie');
    });

    it('should call "matchAboutToStart" when isLocked is true', () => {
        component['isLocked'] = true;
        component.players.length = 1;
        spyOn(socketServiceMock, 'send').and.callThrough();
        component.startMultiplayerGame();
        expect(component['isLocked']).toBe(true);
        expect(component['socketClientService'].send).toHaveBeenCalledWith('matchAboutToStart');
    });

    it('should open a popup when the organizer wants to start a match and isLocked is false', () => {
        component['isLocked'] = false;
        component.players.length = 1;
        component.startMultiplayerGame();
        expect(popupServiceSpy.openPopup).toHaveBeenCalled();
    });

    it('should open a popup when the organizer wants to start a match and there are no players', () => {
        component['isLocked'] = false;
        component.players.length = 0;
        component.startMultiplayerGame();
        expect(popupServiceSpy.openPopup).toHaveBeenCalled();
    });

    it('should open countdown popup', () => {
        component['displayCountdownPopup']();
        expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should call exitWaitRoom() method with the expected parameter', () => {
        component.exitWaitRoom();
        expect(matchManagementServiceSpy.exitMatch).toHaveBeenCalled();
    });

    it('should call banPlayer(index: number) method with the expected parameter', () => {
        const socketClientService = TestBed.inject(SocketClientService);
        const sendSpy = spyOn(socketClientService, 'send');
        const index = 5;
        component.banPlayer(index);
        expect(sendSpy).toHaveBeenCalledWith('banPlayer', component.players[index]);
    });
    it('should handle matchAboutToStart', () => {
        component.ngOnInit();
        socketHelper.peerSideEmit('matchAboutToStart', { res: { matchId: '1234' } });
        expect(component.socketClientService.matchId).toEqual(component['matchId']);
    });

    it('should close listeners when ngOnDestroy is called', () => {
        const socketClientService = TestBed.inject(SocketClientService);
        const removeAllListenersSpy = spyOn(socketClientService, 'removeAllListeners');
        component.ngOnDestroy();
        expect(removeAllListenersSpy).toHaveBeenCalledWith('matchAboutToStart');
        expect(removeAllListenersSpy).toHaveBeenCalledWith('updatedWaitRoomPlayersList');
    });
});
