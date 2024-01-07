/* eslint-disable max-params */
import DbGameFinder from '@app/classes/db-game-finder/db-game-finder';
import Host from '@app/classes/host/host';
import Player from '@app/classes/player/player';
import { Game } from '@app/interfaces/game';
import { Subject } from 'rxjs';
import { Server as Sio, Socket } from 'socket.io';

export default class Match {
    game: Game;
    host: Host;
    isLocked = false;
    hasStarted = false;
    onDestroy = new Subject<void>();
    players: Player[] = [];
    qrlOngoing: boolean = false;
    private bannedPlayers: string[] = [];

    constructor(
        readonly uniqueId: string,
        readonly sio: Sio,
        hostSocket: Socket,
        gameId: string,
    ) {
        this.init(hostSocket, gameId);
    }

    async init(hostSocket: Socket, gameId: string) {
        this.game = await DbGameFinder.findById(gameId);
        this.host = new Host(hostSocket, this.uniqueId, this);
    }

    selfDestructor() {
        this.removeAllPlayers();
        this.host.leaveRoom();
        this.onDestroy.next();
        this.onDestroy.complete();
    }

    toAll(message: string, data?: unknown) {
        this.sio.to(this.uniqueId).emit(message, data);
    }

    async addPlayer(socket: Socket, name: string) {
        if (this.isLocked) {
            throw new Error('Match is locked');
        } else if (!this.validateName(name)) {
            throw new Error('Name is not valid');
        } else {
            const player = new Player(socket, this.uniqueId, name, this);

            let index = 0;
            while (index < this.players.length && this.players[index].name.toLowerCase() < player.name.toLowerCase()) {
                index++;
            }
            this.players.splice(index, 0, player);

            await player.init();
            socket.emit('successfulJoin', { matchId: this.uniqueId, gameId: this.game.id });
            this.toAll('updatedWaitRoomPlayersList', this.getPlayersNameList());
        }
    }

    async banPlayer(playerId: string) {
        const bannedPlayer = this.players.find((player) => player.name === playerId);
        await this.removePlayer(bannedPlayer);
        this.bannedPlayers.push(playerId);
        bannedPlayer.socket.emit('playerBanned');
    }

    async removePlayer(player: Player) {
        await player.leaveRoom();
        this.players.splice(
            this.players.findIndex((removedPlayer) => removedPlayer === player),
            1,
        );
        this.toAll('updatedWaitRoomPlayersList', this.getPlayersNameList());
    }

    async removePlayerFromGame(player: Player) {
        this.host.socket.emit('updatedPlayersOutList', player.name);
        this.host.socket.emit('updatedPlayersOutPoints', player.points);
        await player.leaveRoom();
        this.players.splice(
            this.players.findIndex((removedPlayer) => removedPlayer === player),
            1,
        );
        this.toAll('updatedPlayersList', this.getPlayersNameList());
        if (this.qrlOngoing) {
            this.checkEveryPlayerHasAnswered();
        }
        if (this.players.length === 0) {
            this.selfDestructor();
        }
    }

    async removeAllPlayers() {
        this.players.forEach(async (player) => {
            await player.leaveRoom();
        });
        this.players.length = 0;
    }

    getPlayersNameList(): string[] {
        return this.players.map((player) => player.name);
    }

    getPlayersPointsList(): number[] {
        return this.players.map((player) => player.points);
    }

    getPlayersBonusList(): number[] {
        return this.players.map((player) => player.playerBonus);
    }

    getPlayersTimeList(): number[] {
        return this.players.map((player) => player.time);
    }

    setPlayersTimeToNull() {
        this.players.forEach((player) => {
            player.time = null;
        });
    }

    mutePlayer(player: string) {
        const mutedPlayer = this.players.find((p) => p.name === player);
        if (mutedPlayer) {
            mutedPlayer.isMuted = true;
            mutedPlayer.socket.emit('playerMuted');
        }
    }

    unmutePlayer(player: string) {
        const unmutedPlayer = this.players.find((p) => p.name === player);
        if (unmutedPlayer) {
            unmutedPlayer.isMuted = false;
            unmutedPlayer.socket.emit('playerUnmuted');
        }
    }

    resetQrlAnswers() {
        this.qrlOngoing = true;
        for (const player of this.players) {
            player.resetQrl();
        }
    }
    checkEveryPlayerHasAnswered() {
        if (this.players.every((player) => player.qrlAnswered)) {
            this.host.timer.pause();
            this.host.stopSendRecentChangesToClient();
            this.qrlOngoing = false;
            this.toAll('qrlAnsweredByAllPlayers');
            const answers = this.players.map((player) => {
                return { player: player.name, answer: player.qrlAnswer };
            });
            this.host.socket.emit('qrlAnswers', answers);
        }
    }
    getPlayersPointsMap() {
        const playersPointsMap = this.players.map((player) => {
            return { name: player.name, points: player.points };
        });
        this.host.socket.emit('getPointsMap', playersPointsMap);
    }
    private validateName(name: string): boolean {
        const lowerName = name.toLowerCase();
        const onlyLetters = /^[a-z]+$/i;
        return (
            onlyLetters.test(name) &&
            lowerName !== this.host.name.toLowerCase() &&
            !this.players.some((player) => player.name.toLowerCase() === lowerName) &&
            !this.bannedPlayers.some((bannedName) => bannedName.toLowerCase() === lowerName)
        );
    }
}
