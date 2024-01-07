/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import DbGameFinder from '@app/classes/db-game-finder/db-game-finder';
import Host from '@app/classes/host/host';
import Match from '@app/classes/match/match';
import Player from '@app/classes/player/player';
import { Game } from '@app/interfaces/game';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Server as Sio, Socket } from 'socket.io';

const mockHost = {
    name: 'host',
    leaveRoom: sinon.stub(),
    socket: {
        emit: sinon.stub(),
    },
    timer: {
        pause: () => {},
    },
    stopSendRecentChangesToClient: () => {},
} as unknown as Host;

describe('Match', () => {
    let match: Match;
    let sio: Sio;
    let socket: Socket;
    let dbFinderStub: sinon.SinonStub;
    let emitStub: sinon.SinonStub;
    let emitSpy: sinon.SinonSpy;

    before(() => {
        dbFinderStub = sinon.stub(DbGameFinder, 'findById').resolves({} as Game);
    });

    after(() => {
        dbFinderStub.restore();
    });

    beforeEach(() => {
        emitStub = sinon.stub();
        sio = { to: sinon.stub().returns({ emit: emitStub }) } as unknown as Sio;

        socket = {
            on: sinon.stub(),
            join: sinon.stub(),
            emit: () => {},
            leave: () => {},
            removeAllListeners: () => {},
        } as unknown as Socket;
        emitSpy = sinon.spy(socket, 'emit');

        match = new Match('123', sio, socket, '123');
        match['host'] = mockHost;
    });

    it('should create a match', async () => {
        expect(match).to.be.instanceOf(Match);
    });

    it('should create a match', async () => {
        const nextSpy: sinon.SinonSpy = sinon.spy(match.onDestroy, 'next');
        match.selfDestructor();
        expect(nextSpy.called).to.be.true;
    });

    it('should emit to all sockets on toAll', () => {
        const message = 'test message';
        const data = { key: 'value' };
        match.toAll(message, data);
        expect(emitStub.called).to.be.true;
    });

    it('should throw an error when match is locked', async () => {
        match.isLocked = true;
        try {
            await match.addPlayer(socket, 'playerName');
            expect.fail('Expected addPlayer to throw an error, but it did not');
        } catch (err) {
            expect(err).to.be.an('error');
            expect(err.message).to.equal('Match is locked');
        }
    });

    it('should throw an error if name is already taken, case insensitive', async () => {
        const name = 'NAME';
        const playerStub = { name } as Player;

        match['players'].push(playerStub);
        try {
            await match.addPlayer(socket, name.toLowerCase());
            expect.fail('Expected addPlayer to throw an error, but it did not');
        } catch (err) {
            expect(err).to.be.an('error');
            expect(err.message).to.equal('Name is not valid');
        }
    });

    it('should throw an error if name is already taken, case insensitive', async () => {
        const name = 'NAME';
        const playerStub = { name } as Player;

        match.removePlayer(playerStub);
        expect(match['players'].length).to.equal(0);
    });

    it('should throw an error if name is banned, case insensitive', async () => {
        const name = 'NAME';

        match['bannedPlayers'].push(name);
        try {
            await match.addPlayer(socket, name.toLowerCase());
            expect.fail('Expected addPlayer to throw an error, but it did not');
        } catch (err) {
            expect(err).to.be.an('error');
            expect(err.message).to.equal('Name is not valid');
        }
    });

    it('should not accept names with caracters other than letters', async () => {
        const name1 = ' - ';
        const name2 = '1k';

        try {
            await match.addPlayer(socket, name1);
            expect.fail('Expected addPlayer to throw an error, but it did not');
        } catch (err) {
            expect(err).to.be.an('error');
            expect(err.message).to.equal('Name is not valid');
        }
        try {
            await match.addPlayer(socket, name2);
            expect.fail('Expected addPlayer to throw an error, but it did not');
        } catch (err) {
            expect(err).to.be.an('error');
            expect(err.message).to.equal('Name is not valid');
        }
    });

    it('should add a player to the list if name is unique', async () => {
        const name = 'NAME';
        await match.addPlayer(socket, name);
        expect(match['players'].length).to.equal(1);
    });

    it('should ban a player', async () => {
        await match.addPlayer(socket, 'name');
        await match.banPlayer('name');
        expect(match['bannedPlayers']).to.include('name');
        expect(emitSpy.calledWith('playerBanned')).to.be.true;
        expect(match['players'].length).to.equal(0);
    });

    it('should remove a player', async () => {
        await match.addPlayer(socket, 'name');
        const player = match['players'][0];
        const leaveRoomSpy = sinon.spy(player, 'leaveRoom');
        await match.removePlayer(player);
        expect(leaveRoomSpy.calledOnce).to.be.true;
        expect(match['players'].length).to.equal(0);
    });

    it('should remove a player', async () => {
        await match.addPlayer(socket, 'name');
        const player = match['players'][0];
        const leaveRoomSpy = sinon.spy(player, 'leaveRoom');
        await match.removePlayerFromGame(player);
        expect(leaveRoomSpy.calledOnce).to.be.true;
        expect(match['players'].length).to.equal(0);
    });

    it('should checkEveryPlayerHasAnswered if the qrl is ongoing while a player exits game', async () => {
        match.qrlOngoing = true;
        await match.addPlayer(socket, 'name');
        const player = match['players'][0];
        const spy = sinon.spy(match, 'checkEveryPlayerHasAnswered');
        await match.removePlayerFromGame(player);
        expect(spy.calledOnce).to.be.true;
    });

    it('should destroy match all players exited game', async () => {
        await match.addPlayer(socket, 'name');
        const player = match['players'][0];
        const spy = sinon.spy(match, 'selfDestructor');
        await match.removePlayerFromGame(player);
        expect(spy.calledOnce).to.be.true;
    });

    it('should sort players alphabetically', async () => {
        await match.addPlayer(socket, 'cI');
        await match.addPlayer(socket, 'Ba');
        await match.addPlayer(socket, 'Az');
        const names = match.getPlayersNameList();
        expect(names).to.deep.equal(['Az', 'Ba', 'cI']);
    });

    describe('tests with multiple players', () => {
        const pl1 = 1;
        const pl1Name = 'a';
        const pl2 = 2;
        const pl2Name = 'b';
        const pl3 = 3;
        const pl3Name = 'c';
        beforeEach(async () => {
            await match.addPlayer(socket, pl1Name);
            match['players'][0].points = pl1;
            match['players'][0].time = pl1;
            match['players'][0]['qrlAnswerValue'] = pl1Name;
            match['players'][0]['qrlAnswered'] = true;
            await match.addPlayer(socket, pl2Name);
            match['players'][1].points = pl2;
            match['players'][1].time = pl2;
            match['players'][1]['qrlAnswerValue'] = pl2Name;
            match['players'][1]['qrlAnswered'] = true;
            await match.addPlayer(socket, pl3Name);
            match['players'][2].points = pl3;
            match['players'][2].time = pl3;
            match['players'][2]['qrlAnswerValue'] = pl3Name;
            match['players'][2]['qrlAnswered'] = true;
        });

        it('should remove all players', async () => {
            const leaveRoomSpies = match['players'].map((player) => sinon.spy(player, 'leaveRoom'));
            await match.removeAllPlayers();
            leaveRoomSpies.forEach((spy) => expect(spy.calledOnce).to.be.true);
            expect(match['players'].length).to.equal(0);
        });

        it('should get players name list', () => {
            const names = match.getPlayersNameList();
            expect(names).to.deep.equal([pl1Name, pl2Name, pl3Name]);
        });

        it('should get players name list', () => {
            const names = match.getPlayersBonusList();
            expect(names).to.deep.equal([0, 0, 0]);
        });

        it('should get players points list', () => {
            const points = match.getPlayersPointsList();
            expect(points).to.deep.equal([pl1, pl2, pl3]);
        });

        it('should get players time list', () => {
            const times = match.getPlayersTimeList();
            expect(times).to.deep.equal([pl1, pl2, pl3]);
        });

        it('should set players time to null', () => {
            match.setPlayersTimeToNull();
            const times = match.getPlayersTimeList();
            expect(times).to.deep.equal([null, null, null]);
        });

        it('should mute a player', () => {
            match.mutePlayer(pl1Name);
            expect(match['players'][0].isMuted).to.be.true;
        });

        it('should unmute a player', () => {
            match.unmutePlayer(pl1Name);
            expect(match['players'][0].isMuted).to.be.false;
        });

        it('should not mute a player if he is not in the match', () => {
            match.mutePlayer('d');
            expect(match['players'][0].isMuted).to.be.false;
        });

        it('should not unmute a player if he is not in the match', () => {
            match.unmutePlayer('d');
            expect(match['players'][0].isMuted).to.be.false;
        });
        it('should resetQrlAnswers', () => {
            match.resetQrlAnswers();
            expect(match['players'][0].qrlAnswer).to.equal('');
            expect(match['players'][1].qrlAnswer).to.equal('');
            expect(match['players'][2].qrlAnswer).to.equal('');
        });
        it('should send results if all players have answered', async () => {
            await match.checkEveryPlayerHasAnswered();
            expect(emitSpy.called).to.be.true;
        });
        it('should emit playersPointsMap on getPlayersPointsMap', () => {
            match.getPlayersPointsMap();
            expect(emitSpy.called).to.be.true;
        });
        it('should emit a map on getPlayersPointsMap', () => {
            match.getPlayersPointsMap();
            expect(emitSpy.called).to.be.true;
        });
    });
});
