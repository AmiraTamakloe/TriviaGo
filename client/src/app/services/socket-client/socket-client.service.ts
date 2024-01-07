/* eslint-disable @typescript-eslint/ban-types */
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    socket: Socket;
    matchId: string;
    constructor() {
        this.connect();
    }

    connect() {
        this.socket = io(environment.serverUrl, { transports: ['websocket'], upgrade: false });
    }
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
    on<T>(event: string, action: (data: T) => void, dataToSend?: T): void {
        if (this.socket) {
            if (dataToSend) {
                this.socket.emit(event, dataToSend);
            }
            this.socket.on(event, action);
        }
    }

    send<T>(event: string, data?: T, callback?: Function): void {
        if (this.socket) {
            this.socket.emit(event, ...[data, callback].filter((x) => x));
        }
    }

    removeAllListeners(event?: string): void {
        if (this.socket) {
            if (event) {
                this.socket.removeAllListeners(event);
            } else {
                this.socket.removeAllListeners();
            }
        }
    }
}
