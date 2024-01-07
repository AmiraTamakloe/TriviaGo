/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import DbGameFinder from '@app/classes/db-game-finder/db-game-finder';
import Match from '@app/classes/match/match';
import Player from '@app/classes/player/player';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { HOST_NAME } from '@common/constants';
import { TimerControl } from '@common/timer-state';
import { expect } from 'chai';
import { Subject } from 'rxjs';
import * as sinon from 'sinon';
import { Socket } from 'socket.io';
import Host from './host';

describe('Host', () => {
    let selfDestructorSpy: sinon.SinonSpy;
    let toAllSpy: sinon.SinonSpy;
    let emitSpy: sinon.SinonSpy;
    const socket = new SocketTestHelper();
    const onDestroyStub = new Subject<void>();
    let host: Host;
    const gameid = '0000';
    const mockMatch = {
        onDestroy: onDestroyStub,
        destructor: sinon.stub(),
        addPlayer: sinon.stub(),
        getPlayersNameList: sinon.stub(),
        toAll: () => {},
        banPlayer: () => {},
        setPlayersTimeToNull: () => {},
        getPlayersBonusList: () => {},
        getPlayersPointsMap: () => {},
        getPlayersPointsList: () => {
            return [1, 2, 3];
        },
        getPlayersTimeList: () => {
            return [1, 2, 3];
        },
        mutePlayer: () => {},
        unmutePlayer: () => {},
        selfDestructor: () => {},
        resetQrlAnswers: () => {},
        uniqueId: '0000',
        game: { duration: 10, id: gameid, questions: [{ points: 10 }] },
        players: [
            {
                name: 'player1',
                points: 0,
                pastPoints: 0,
                bonus: 0,
                socket: { emit: () => {} } as unknown as Socket,
            },
            {
                name: 'player2',
                pastPoints: 0,
                points: 0,
                bonus: 0,
                socket: { emit: () => {} } as unknown as Socket,
            },
        ],
        sio: {
            to: () => {
                return {
                    emit: () => {},
                };
            },
        },
    } as unknown as Match;

    beforeEach(() => {
        host = new Host(socket as unknown as Socket, '1234', mockMatch);
        host.matchHistory.push({
            gameName: host.match.game.title,
            date: new Date().toLocaleDateString(),
            playersNumber: host.match.getPlayersPointsList().length,
            bestScore: 2,
        });
        selfDestructorSpy = sinon.spy(mockMatch, 'selfDestructor');
        toAllSpy = sinon.spy(mockMatch, 'toAll');
        emitSpy = sinon.spy(socket, 'emit');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should create a host', () => {
        expect(host).to.be.instanceOf(Host);
        expect(host.name).to.equal(HOST_NAME);
    });

    it('should self destruct if the game does not exist when matchAboutToStart is received', () => {
        sinon.stub(DbGameFinder, 'findById').throws('Fake error');
        socket.peerSideEmit('matchAboutToStart');
        expect(selfDestructorSpy.called).to.be.true;
    });
    it('should send matchAboutToStart to everyone', async () => {
        sinon.stub(DbGameFinder, 'findById').resolves({});
        await socket.peerSideEmit('matchAboutToStart');
        expect(toAllSpy.called).to.be.true;
    });

    it('should trigger changeLockState on changeLockState socket event ', () => {
        const spy = sinon.spy(host, 'changeLockState');
        socket.peerSideEmit('changeLockState', true);
        expect(spy.called).to.be.true;
    });

    it('should trigger ban player on ban player socket event ', () => {
        const spy = sinon.spy(mockMatch, 'banPlayer');
        socket.peerSideEmit('banPlayer');
        expect(spy.called).to.be.true;
    });

    it('should emit updatedPlayersPoints on getPlayersPoints event', () => {
        socket.peerSideEmit('getPlayersPoints');
        expect(emitSpy.called).to.be.true;
    });

    it('should emit updatedPlayersPoints on getPlayersBonus event', () => {
        socket.peerSideEmit('getPlayersBonus');
        expect(emitSpy.called).to.be.true;
    });

    it('should set player time to null on questionOver', () => {
        const spy = sinon.spy(mockMatch, 'setPlayersTimeToNull');
        socket.peerSideEmit('questionOver');
        expect(spy.called).to.be.true;
    });

    it('should start new question on questionTimer', () => {
        const spy = sinon.spy(host.timer, 'startNewQuestion');
        socket.peerSideEmit('questionTimer');
        expect(spy.called).to.be.true;
        socket.peerSideEmit('questionTimer', 'QCM');
        expect(spy.called).to.be.true;
    });

    it('should stop timer', () => {
        const spy = sinon.spy(host.timer, 'pause');
        socket.peerSideEmit('stopTimer');
        expect(spy.called).to.be.true;
    });

    it('should call toAll on exitWaitRoom', () => {
        socket.peerSideEmit('exitWaitRoom', () => {
            expect(toAllSpy.called).to.be.true;
        });
    });

    it('should call toAll on disconnect', () => {
        socket.peerSideEmit('disconnect', () => {
            expect(toAllSpy.called).to.be.true;
        });
    });

    it('should emit matchCanceled and call selfDestructor on exitWaitRoom', () => {
        socket.peerSideEmit('exitWaitRoom', () => {
            expect(toAllSpy.calledWith('matchCanceled')).to.be.true;
            expect(selfDestructorSpy.called).to.be.true;
        });
    });

    it('should emit questionAnswered toAll on questionAnswered', () => {
        mockMatch.getPlayersTimeList = () => {
            return [null];
        };
        const spy = sinon.spy(mockMatch, 'getPlayersTimeList');
        socket.peerSideEmit('questionAnswered');
        expect(spy.called).to.be.true;
    });

    it('should emit questionAnswered toAll on questionAnswered', () => {
        mockMatch.getPlayersTimeList = () => {
            return [1, 2];
        };
        const spy = sinon.spy(mockMatch, 'getPlayersTimeList');
        socket.peerSideEmit('questionAnswered');
        expect(spy.called).to.be.true;
    });
    it('should emit mutePlayer on mutePlayer', () => {
        const spy = sinon.spy(mockMatch, 'mutePlayer');
        socket.peerSideEmit('mutePlayer');
        expect(spy.called).to.be.true;
    });
    it('should emit unmutePlayer on unmutePlayer', () => {
        const spy = sinon.spy(mockMatch, 'unmutePlayer');
        socket.peerSideEmit('unmutePlayer');
        expect(spy.called).to.be.true;
    });
    it('should call match selfDestructor on exitMatch', () => {
        socket.peerSideEmit('exitMatch', () => {
            expect(selfDestructorSpy.called).to.be.true;
        });
    });

    it('should call match selfDestructor on exitWaitRoom', () => {
        socket.peerSideEmit('exitWaitRoom', () => {
            expect(selfDestructorSpy.called).to.be.true;
        });
    });

    it('should emit on getPlayersBonus', () => {
        socket.peerSideEmit('getPlayersBonus');
        expect(emitSpy.called).to.be.true;
    });

    it('should emit on getPlayersList', () => {
        socket.peerSideEmit('getPlayersList');
        expect(emitSpy.called).to.be.true;
    });

    it('should emit final results to all on finalResultsForAll', () => {
        socket.peerSideEmit('finalResultsForAll');
        expect(toAllSpy.calledWith('displayFinalResults')).to.be.true;
    });

    it('should call match getPlayersPointsMap on getPointsMap', () => {
        const spy = sinon.spy(mockMatch, 'getPlayersPointsMap');
        socket.peerSideEmit('getPointsMap');
        expect(spy.called).to.be.true;
    });

    it('should call timer.pause on timerControl pause', () => {
        const spy = sinon.spy(host.timer, 'pause');
        socket.peerSideEmit('timerControl', TimerControl.pause);
        expect(spy.called).to.be.true;
    });
    it('should call timer.resume on timerControl resume', () => {
        const spy = sinon.spy(host.timer, 'resume');
        socket.peerSideEmit('timerControl', TimerControl.resume);
        expect(spy.called).to.be.true;
    });
    it('should call timer.panic on timerControl panic', () => {
        const spy = sinon.spy(host.timer, 'panic');
        socket.peerSideEmit('timerControl', TimerControl.panic);
        expect(spy.called).to.be.true;
    });

    it('should emit histogramsForResult to all on histogramsSent', () => {
        socket.peerSideEmit('histogramsSent');
        expect(toAllSpy.calledWith('histogramsForResult')).to.be.true;
    });
    it('should set interval on sendQrlRecentChangesToClient', () => {
        host.sendQrlRecentChangesToClient();
        expect(host['interval']).to.not.equal(null);
    });
    it('should clear interval on stopSendChangesToClient', () => {
        host.sendQrlRecentChangesToClient();
        expect(host['interval']).to.not.equal(null);
        host.stopSendRecentChangesToClient();
        host.stopSendRecentChangesToClient();
    });
    it('should emit qrlExaminationDone to all on qrlExaminationDone', () => {
        socket.peerSideEmit('qrlExaminationDone', {
            results: [
                { player: 'player1', note: 1 },
                { player: 'player2', note: 2 },
            ],
            questionNumber: 0,
        });
        expect(toAllSpy.calledWith('qrlExaminationDone')).to.be.true;
    });
    it('should emit newQrl to all on newQrl', () => {
        const spy = sinon.spy(mockMatch, 'resetQrlAnswers');
        socket.peerSideEmit('newQrl');
        expect(spy.called).to.be.true;
    });
    it('should call toAll on finalResultsForAll', () => {
        host.match.players = [];
        const name = 'NAME';
        const playerStub = { name } as Player;
        host.match['players'].push(playerStub);
        socket.peerSideEmit('finalResultsForAll', () => {
            expect(toAllSpy.called).to.be.true;
        });
    });
});
