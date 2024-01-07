/* eslint-disable max-params */
import Match from '@app/classes/match/match';
import { MAX_LENGTH_MESSAGE } from '@common/constants';
import { Socket } from 'socket.io';
export default class User {
    isMuted: boolean = false;

    protected time: number = 0;
    protected points: number = 0;
    protected events: string[] = [];

    constructor(
        readonly socket: Socket,
        readonly matchId: string,
        readonly name: string,
        readonly match: Match,
    ) {
        this.on('waitRoomPageInitialized', () => {
            this.socket.emit('updatedWaitRoomPlayersList', this.match.getPlayersNameList());
        });
        this.on<{ code: string; text: string }>('messageText', (message) => {
            if (message.text && !this.isMuted) {
                if (message.text.length > MAX_LENGTH_MESSAGE) {
                    message.text = 'MESSAGE TROP LONG';
                    this.socket.emit('messageText', { text: message.text, color: 'red', time: new Date().toLocaleTimeString(), author: 'Système' });
                } else {
                    this.socket.emit('messageText', { author: name, text: message.text, color: 'black', time: new Date().toLocaleTimeString() });
                    this.socket.broadcast.to(message.code).emit('messageText', {
                        text: message.text,
                        color: 'blue',
                        author: name,
                        time: new Date().toLocaleTimeString(),
                    });
                }
            }
        });
    }
    async init() {
        await this.socket.join(this.matchId);
        this.match.toAll('updatedPlayersList', this.match.getPlayersNameList());
    }

    async leaveRoom() {
        this.socket.emit('backToHomePage');
        await this.socket.leave(this.matchId);
        this.events.forEach((event) => {
            this.socket.removeAllListeners(event);
        });
    }

    on<T>(event: string, action: (data: T) => void, dataToSend?: T): void {
        if (dataToSend) {
            this.socket.emit(event, dataToSend);
        }
        this.socket.on(event, action);
        this.events.push(event);
    }
}
