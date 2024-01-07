/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-empty-function */
import Match from '@app/classes/match/match';
import Player from '@app/classes/player/player';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Socket } from 'socket.io';
describe('Player', () => {
    const socket = new SocketTestHelper();
    let player: Player;
    let emitSpy: sinon.SinonSpy;
    let removeSpy: sinon.SinonSpy;
    let removeFromGameSpy: sinon.SinonSpy;
    let hostEmitSpy: sinon.SinonSpy;
    let toAllSpy: sinon.SinonSpy;
    const mockMatch = {
        removePlayer: () => {},
        removePlayerFromGame: () => {},
        getPlayersTimeList: () => {
            return [1, 2, 3];
        },
        getPlayersNameList: () => {
            return ['cedric', 'julien', 'julien2'];
        },
        setPlayersTimeToNull: () => {},
        checkEveryPlayerHasAnswered: () => {},
        toAll: () => {},
        host: {
            socket: new SocketTestHelper() as unknown as Socket,
            playerCount: 3,
        },
        game: {
            questions: [{ points: 10 }],
        },
        players: {
            name: 'player1',
        },
    } as unknown as Match;

    before(() => {
        emitSpy = sinon.spy(socket, 'emit');
        removeSpy = sinon.spy(mockMatch, 'removePlayer');
        removeFromGameSpy = sinon.spy(mockMatch, 'removePlayerFromGame');
        hostEmitSpy = sinon.spy(mockMatch.host.socket, 'emit');
        toAllSpy = sinon.spy(mockMatch, 'toAll');
    });
    after(() => {
        sinon.restore();
    });

    beforeEach(() => {
        player = new Player(socket as unknown as Socket, '0000', 'name', mockMatch);
    });

    it('should call match removePlayer on disconnect', () => {
        socket.peerSideEmit('disconnect');
        expect(removeSpy.called).to.be.true;
    });

    it('should call match removePlayerFromGame on exitMatch', () => {
        socket.peerSideEmit('exitMatch');
        expect(removeFromGameSpy.called).to.be.true;
    });

    it('should emit updatedPlayersList on getPlayersList', () => {
        socket.peerSideEmit('getPlayersList');
        expect(emitSpy.called).to.be.true;
    });

    it('should emit updatedPlayersPoints on getPlayersPoints', () => {
        socket.peerSideEmit('getPlayersPoints');
        expect(emitSpy.called).to.be.true;
    });

    it('should emit bonusNotification on scoreAttribution', async () => {
        const message = {
            answer: true,
            currentPoint: 0,
            correction: false,
        };
        socket.peerSideEmit('scoreAttribution', message);
        socket.peerSideEmit('scoreAttribution', [0, 0]);
        expect(emitSpy.called).to.be.true;
    });

    it('should emit questionOver on question over', () => {
        socket.peerSideEmit('questionOver');
        expect(emitSpy.calledWith('questionOver')).to.be.true;
    });

    it('should emit questionAnswered on questionAnswered', () => {
        socket.peerSideEmit('questionAnswered', 1);
        expect(toAllSpy.called).to.be.true;
        expect(player.time).to.equal(1);
    });

    it('should handle updateTime', () => {
        player['time'] = 3;
        player['updateTime'](false);
        expect(player['time']).to.equal(0);
    });

    it('should handle updatePoints', () => {
        player['time'] = 3;
        player['updatePoints'](1, true, true);
        expect(player['isFirst']).to.equal(true);
    });

    it('should handle updatePoints', () => {
        player['time'] = 2;
        player['updatePoints'](1, true, true);
        expect(player['isFirst']).to.equal(false);
    });

    it('should handle updatePoints', () => {
        player['time'] = 1;
        player['updatePoints'](1, false, false);
        expect(player['isFirst']).to.equal(false);
    });

    it('should emit playerAnswerIndex on playerAnswerIndex', () => {
        socket.peerSideEmit('playerAnswerIndex', [1, 2, 3]);
        expect(hostEmitSpy.called).to.be.true;
    });

    it('should remove player on exit waitroom', () => {
        socket.peerSideEmit('exitWaitRoom');
        expect(removeSpy.called).to.be.true;
    });

    it('should emit player answer index to host on player answer index', () => {
        socket.peerSideEmit('exitWaitRoom');
        expect(hostEmitSpy.called).to.be.true;
    });

    it('should emit scoreCorrection on wrong answer', () => {
        socket.peerSideEmit('wrongAnswer', true);
        expect(toAllSpy.called).to.be.true;
    });

    it('should emit updatedPlayersBonus on getPlayersBonus', () => {
        socket.peerSideEmit('getPlayersBonus', true);
        expect(emitSpy.calledWith('updatedPlayersBonus')).to.be.true;
    });

    it('should set and get bonus', () => {
        player.playerBonus = 1;
        expect(player.playerBonus).to.equal(1);
    });
    it('should call checkEveryPlayerHasAnswered on qrlAnswer', () => {
        const spy = sinon.spy(mockMatch, 'checkEveryPlayerHasAnswered');
        socket.peerSideEmit('qrlAnswer', 'answer');
        expect(spy.called).to.be.true;
    });
    it('should set lastFiveSecQrlTextInputChange to true on qrlTextInputChange', () => {
        const delay = 1000;
        player['timeout'] = 0;
        player['resetQrlChangeTimeOut'] = setTimeout(() => {}, delay);
        socket.peerSideEmit('qrlTextInputChange');
        expect(player.lastFiveSecQrlTextInputChange).to.be.true;
    });

    it('should emit firstInteraction on firstInteraction', () => {
        socket.peerSideEmit('firstInteraction');
        expect(hostEmitSpy.called).to.be.true;
    });

    it('should emit enterClick on enterClick', () => {
        socket.peerSideEmit('enterClick');
        expect(hostEmitSpy.called).to.be.true;
    });
});
