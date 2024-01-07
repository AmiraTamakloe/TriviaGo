/* eslint-disable no-console */
import MatchManager from '@app/classes//match-manager/match-manager';
import * as http from 'http';
import * as io from 'socket.io';

export class SocketManager {
    sio: io.Server;
    matchManager: MatchManager;

    constructor(server: http.Server) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.matchManager = new MatchManager();
    }

    handleSockets() {
        this.sio.on('connection', (socket: io.Socket) => {
            this.initSocket(socket);
        });
    }

    initSocket(socket: io.Socket) {
        socket.on('reinitializeSocketListeners', () => {
            socket.removeAllListeners();
            this.initSocket(socket);
        });

        socket.on('createMatch', (gameId, callback) => {
            const matchId = this.matchManager.createMatch(socket, this.sio, gameId);
            callback({ matchId });
        });

        socket.on('attemptJoinMatch', (data) => {
            this.matchManager.attemptJoinMatch(socket, data);
        });
    }
}
