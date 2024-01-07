import IdGenerator from '@app/classes/id-generator/id-generator';
import Match from '@app/classes/match/match';
import { Subscription } from 'rxjs';
import { Server, Socket } from 'socket.io';

export default class MatchManager {
    private matches: Match[] = [];
    private subscriptions: Subscription[] = [];

    createMatch(socket: Socket, sio: Server, gameId: string) {
        const match = new Match(this.generateUniqueId(), sio, socket, gameId);
        this.matches.push(match);

        const subscription = match.onDestroy.subscribe(() => {
            const index = this.matches.indexOf(match);
            this.matches.splice(this.matches.indexOf(match), 1);
            this.subscriptions[index].unsubscribe();
            this.subscriptions.splice(index, 1);
        });

        this.subscriptions.push(subscription);
        return this.matches[this.matches.length - 1].uniqueId;
    }

    async attemptJoinMatch(socket: Socket, data: { code: string; name: string }) {
        try {
            const match = this.getMatchById(data.code);
            try {
                await match.addPlayer(socket, data.name);
            } catch (e) {
                if (e.message === 'Name is not valid') {
                    socket.emit('wrongUserName');
                } else if (e.message === 'Match is locked') {
                    socket.emit('matchLocked');
                }
            }
        } catch (e) {
            socket.emit('wrongMatchId');
        }
    }

    private getMatchById(id: string): Match {
        const match = this.matches.find((item) => item.uniqueId === id);
        if (!match) {
            throw new Error(`Match with id ${id} does not exist`);
        }
        return match;
    }

    private generateUniqueId(): string {
        let id: string;
        do {
            id = IdGenerator.randomCode();
        } while (this.matches.some((match) => match.uniqueId === id));
        return id;
    }
}
