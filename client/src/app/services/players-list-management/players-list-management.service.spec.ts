/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { PopupService } from '@app/services/popup/popup.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Socket } from 'socket.io-client';
import { PlayersListManagementService } from './players-list-management.service';

class SocketClientServiceMock extends SocketClientService {
    override connect() {}
    // eslint-disable-next-line no-unused-vars
    override removeAllListeners(event?: string) {}
}

describe('PlayersListManagementService', () => {
    let service: PlayersListManagementService;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    let popupServiceSpy: jasmine.SpyObj<PopupService>;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;

        popupServiceSpy = jasmine.createSpyObj('PopupService', ['openPopup', 'closePopup']);

        TestBed.configureTestingModule({
            imports: [MatSnackBarModule],
            providers: [
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: PopupService, useValue: popupServiceSpy },
            ],
        });
        service = TestBed.inject(PlayersListManagementService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call popupService.closePopup when closePopup is called', () => {
        service.closePopup();
        expect(popupServiceSpy.closePopup).toHaveBeenCalled();
    });

    it('should initialize the matchId', () => {
        service.init();
        socketHelper.peerSideEmit('updatedPlayersPoints', [1, 2]);
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId', () => {
        service.init();
        socketHelper.peerSideEmit('updatedPlayersList', [1, 2]);
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId', () => {
        service.init();
        socketHelper.peerSideEmit('updatedPlayersBonus', [1, 2]);
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId', () => {
        service.init();
        socketHelper.peerSideEmit('bonusNotification', true);
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId', () => {
        service.init();
        socketHelper.peerSideEmit('updatedPlayersOutList', true);
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId', () => {
        service.init();
        socketHelper.peerSideEmit('updatedPlayersOutPoints', true);
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should set players out points list correctly', () => {
        const newPlayerPoints = [5, 15, 25];
        service.playersOutPointsList = newPlayerPoints;
        expect(service['allPlayersOutPoints']).toEqual(newPlayerPoints);
    });

    it('should return the correct players out list', () => {
        const expectedPlayersOutList = ['player4', 'player5', 'player6'];
        service['playersOut'] = expectedPlayersOutList;
        const playersOutList = service.playersOutList;
        expect(playersOutList).toEqual(expectedPlayersOutList);
    });

    it('should return the correct players out points list', () => {
        const expectedPlayersOutPointsList = [10, 20, 30];
        service['allPlayersOutPoints'] = expectedPlayersOutPointsList;
        const playersOutPointsList = service.playersOutPointsList;
        expect(playersOutPointsList).toEqual(expectedPlayersOutPointsList);
    });

    it('should return the correct players bonus list', () => {
        const testBonusList = [1, 2, 3];
        service['allPlayersBonus'] = testBonusList;

        expect(service.playersBonusList).toEqual(testBonusList);
    });

    it('should initialize the matchId', () => {
        service.init();
        socketHelper.peerSideEmit('scoreCorrection', 0);
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId', () => {
        service.init();
        socketHelper.peerSideEmit('firstInteraction', 'ced');
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId', () => {
        service.init();
        socketHelper.peerSideEmit('enterClick', 'ced');
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should initialize the matchId', () => {
        service.init();
        socketHelper.peerSideEmit('questionOver');
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should update player points', () => {
        const points = [1, 2];
        socketHelper.peerSideEmit('updatedPlayersPoints', points);
        service['playersPointsList'] = points;
        expect(service.playersPointsList).toEqual(points);
    });

    it('should send correct data to the server when scoreAttribution is called', () => {
        const spy = spyOn(service.socketClientService, 'send');
        const isAllGoodAnswerChecked = true;
        const questionNumber = 1;
        service['matchId'] = '1234';
        service.scoreAttribution(isAllGoodAnswerChecked, questionNumber, false);
        expect(spy).toHaveBeenCalledWith('scoreAttribution', {
            answer: isAllGoodAnswerChecked,
            currentPoint: questionNumber,
            correction: false,
        });
    });

    it('should set isAnswerGood to the value passed to scoreAttribution', () => {
        const isAllGoodAnswerChecked = true;
        const questionNumber = 1;
        service.scoreAttribution(isAllGoodAnswerChecked, questionNumber, false);
        expect(service.isAnswerGood).toEqual(isAllGoodAnswerChecked);
    });

    it('should send correct data to the server when wrongAnswer is called', () => {
        const spy = spyOn(service.socketClientService, 'send');
        const isAllGoodAnswerChecked = true;
        service['matchId'] = '1234';
        service.wrongAnswer(isAllGoodAnswerChecked, 1);
        expect(spy).toHaveBeenCalledWith('wrongAnswer', true);
    });

    it('should set isAnswerGood to the value passed to wrongAnswer', () => {
        const isAllGoodAnswerChecked = true;
        service.wrongAnswer(isAllGoodAnswerChecked, 1);
        expect(service.isAnswerGood).toEqual(isAllGoodAnswerChecked);
    });

    it('should return the correct players list', () => {
        const expectedPlayersList = ['player1', 'player2', 'player3'];
        service['players'] = expectedPlayersList;
        const playersList = service.playersList;
        expect(playersList).toEqual(expectedPlayersList);
    });

    it('should call removeAllListeners method for each event when endGame is called', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service, 'removeListeners');
        service.endGame();
        expect(spy).toHaveBeenCalled();
    });

    it('should emit playersPointsListChange when getPointsMap is called', () => {
        const pointsMap = new Map<number, { name: string; points: number }>();
        pointsMap.set(1, { name: 'ced', points: 10 });
        const spy = spyOn(service.playersPointsListChange, 'emit');
        service.init();
        socketHelper.peerSideEmit('getPointsMap', pointsMap);
        expect(spy).toHaveBeenCalled();
    });
});
