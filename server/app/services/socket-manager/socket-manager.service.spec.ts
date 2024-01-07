/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Server } from 'app/server';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Socket, io as ioClient } from 'socket.io-client';
import { Container } from 'typedi';
import { SocketManager } from './socket-manager.service';

describe('SocketManager', () => {
    let service: SocketManager;
    let server: Server;
    let clientSocket: Socket;

    const urlString = 'http://localhost:3000';
    beforeEach(async () => {
        server = Container.get(Server);
        await server.init();
        service = server['socketManager'];
        clientSocket = ioClient(urlString);
        clientSocket.id = '1';
    });

    after(() => {
        service['sio'].close();
        sinon.restore();
    });

    beforeEach(() => {
        clientSocket.emit('reinitializeSocketListeners');
    });

    it('should handle a "createMatch" event', (done) => {
        const removeAllListenersSpy = sinon.spy(clientSocket, 'removeAllListeners');
        const initSocketSpy = sinon.spy(service, 'initSocket');
        clientSocket.emit('createMatch', 'test game id', (response: { matchId: string }) => {
            expect(response.matchId).to.be.a('string');
            done();
        });
        clientSocket.emit('attemptJoinMatch', (data: { code: string; name: string }) => {
            expect(data.code).to.be.a('string');
            done();
        });
        clientSocket.emit('reinitializeSocketListeners', () => {
            expect(removeAllListenersSpy.called).to.be.true;
            expect(initSocketSpy.called).to.be.true;
            done();
        });
    });
});
