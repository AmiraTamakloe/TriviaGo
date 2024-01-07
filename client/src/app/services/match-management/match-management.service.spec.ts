/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-types */
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { History } from '@app/interfaces/history';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameModeSelectionService } from '@app/services/game-mode-selection/game-mode-selection.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { MatchManagementService } from './match-management.service';

class SocketClientServiceMock extends SocketClientService {
    override connect() {}
    // eslint-disable-next-line no-unused-vars
    override removeAllListeners(event?: string) {}
}

describe('MatchManagementService', () => {
    let service: MatchManagementService;
    let routerSpy: jasmine.SpyObj<Router>;
    let mockDialog: jasmine.SpyObj<MatDialog>;
    let gameModeSelectionServiceSpy: jasmine.SpyObj<GameModeSelectionService>;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
    let gameHistoryServiceSpy: jasmine.SpyObj<GameHistoryService>;

    beforeEach(() => {
        mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        gameModeSelectionServiceSpy = jasmine.createSpyObj('GameModeSelectionService', ['setSelectedMode']);
        gameHistoryServiceSpy = jasmine.createSpyObj('GameHistoryService', ['postGameHistory']);
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['queryParams'], {
            queryParams: of({ organizer: 'true' }),
        });
        TestBed.configureTestingModule({
            providers: [
                { provide: GameHistoryService, useValue: gameHistoryServiceSpy },
                { provide: MatDialog, useValue: mockDialog },
                { provide: Router, useValue: routerSpy },
                { provide: GameModeSelectionService, useValue: gameModeSelectionServiceSpy },
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
                { provide: SocketClientService, useValue: socketServiceMock },
            ],
            imports: [MatSnackBarModule, BrowserAnimationsModule],
        });
        service = TestBed.inject(MatchManagementService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should handle the exiting match', () => {
        const spy = spyOn(service.socketClientService, 'send');
        service.exitMatch();
        expect(spy).toHaveBeenCalled();
    });

    it('should handle creating a  test match', () => {
        const spy = spyOn(service.socketClientService, 'send').and.callFake((event, data, cb: Function) => {
            cb({ isValid: '4321' });
        });
        const eventName = 'createMatch';
        const id = '1234';
        service.createTestMatch(id);
        expect(spy).toHaveBeenCalledWith(eventName, id, jasmine.any(Function));
    });

    it('should handle creating a match', () => {
        const spy = spyOn(service.socketClientService, 'send').and.callFake((event, data, cb: Function) => {
            cb({ isValid: '4321' });
        });
        const eventName = 'createMatch';
        const id = '1234';
        service.createMatch(id);
        expect(spy).toHaveBeenCalledWith(eventName, id, jasmine.any(Function));
    });

    it('should handle lockState', () => {
        const spy = spyOn(service.socketClientService, 'send');
        service.exitMatch();
        service.lockState(true);
        expect(spy).toHaveBeenCalled();
    });

    it('should handle lockState', () => {
        const spy = spyOn(service.socketClientService, 'send');
        service.finalResult();
        expect(spy).toHaveBeenCalled();
    });

    it('should initialize the matchId1', () => {
        service.init();
        socketHelper.peerSideEmit('matchStarted', { res: { matchId: '1234' } });
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId2', () => {
        service.init();
        socketHelper.peerSideEmit('wrongUserName');
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId3', () => {
        service.init();
        socketHelper.peerSideEmit('wrongMatchId');
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId4', () => {
        service.init();
        socketHelper.peerSideEmit('questionTimer', 0);
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId5', () => {
        service.init();
        socketHelper.peerSideEmit('backToHomePage');
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should handle the start of the match', () => {
        service.startMatch();
        expect(gameModeSelectionServiceSpy.setSelectedMode).toHaveBeenCalledWith('multi');
    });

    it('should initialize the matchId6', () => {
        service.init();
        socketHelper.peerSideEmit('matchAboutToStart');
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId7', () => {
        const history: History = {
            gameName: 'Cedrick test',
            date: '11/9/2023',
            playersNumber: 2,
            bestScore: 60,
        };
        gameHistoryServiceSpy.postGameHistory.and.returnValue(of(history));
        service.init();
        socketHelper.peerSideEmit('gameHistory');
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId8', () => {
        service.init();
        socketHelper.peerSideEmit('exitMatch');
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId9', () => {
        service.init();
        socketHelper.peerSideEmit('playerExit');
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId10', () => {
        service.init();
        socketHelper.peerSideEmit('playerBanned');
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId11', () => {
        service.init();
        socketHelper.peerSideEmit('playerLeftNotif', 'Arnaud');
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId12', () => {
        service.init();
        socketHelper.peerSideEmit('matchLocked');
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId13', () => {
        service.init();
        socketHelper.peerSideEmit('displayFinalResults');
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId14', () => {
        service.init();
        socketHelper.peerSideEmit('matchCanceled');
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId15', () => {
        service.init();
        socketHelper.peerSideEmit('gameNotFound');
        expect(routerSpy.navigate).toHaveBeenCalled();
    });

    it('should initialize the matchId16', () => {
        service.init();
        socketHelper.peerSideEmit('timeIsUp');
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId17', () => {
        service.init();
        socketHelper.peerSideEmit('matchOver');
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId18', () => {
        service.init();
        socketHelper.peerSideEmit('successfulJoin', { data: { matchId: '1234', gameId: '1234' } });
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should return the correct organizer status', () => {
        service['organizer'] = true;
        expect(service.getIsOrganizer()).toBeTrue();
        service['organizer'] = false;
        expect(service.getIsOrganizer()).toBeFalse();
    });

    it('should call private method removeListeners when endGame is called', () => {
        const spy = spyOn<any>(service, 'removeListeners');
        service.endGame();
        expect(spy).toHaveBeenCalled();
    });
    it('should call removeAllListeners method for each event', () => {
        service.init();
        const spy = spyOn<any>(service.socketClientService, 'removeAllListeners');
        service['removeListeners']();
        expect(spy).toHaveBeenCalled();
    });
});
