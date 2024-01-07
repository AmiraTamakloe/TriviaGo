/* eslint-disable max-params */
import Match from '@app/classes/match/match';
import User from '@app/classes/user/user';
import { BONUS_POINTS, TIMEOUT } from '@common/constants';
import { Socket } from 'socket.io';

export default class Player extends User {
    time: number = null;
    points: number = 0;
    bonus: number = 0;
    isFirst: boolean = false;
    pastPoints: number = 0;
    qrlAnswered: boolean = false;
    private lastFiveSecQrlTextInputChangeValue: boolean = false;
    private qrlAnswerValue: string = '';
    private resetQrlChangeTimeOut: NodeJS.Timeout = null;
    private timeout = TIMEOUT;

    constructor(socket: Socket, matchId: string, name: string, match: Match) {
        super(socket, matchId, name, match);
        this.on('disconnect', () => {
            this.match.removePlayer(this);
        });
        this.on('getPlayersList', () => {
            this.socket.emit('updatedPlayersList', [this.name]);
        });

        this.on('getPlayersPoints', () => {
            this.socket.emit('updatedPlayersPoints', [this.points, this.pastPoints]);
        });

        this.on('getPlayersBonus', () => {
            this.socket.emit('updatedPlayersBonus', [this.bonus]);
        });

        this.on('scoreAttribution', async (message: { answer: boolean; currentPoint: number; correction: boolean }) => {
            this.socket.emit(
                'bonusNotification',
                this.updatePoints(this.match.game.questions[message.currentPoint].points, message.answer, message.correction),
            );
            this.socket.emit('updatedPlayersPoints', [this.points, this.pastPoints]);
            const numClients = this.match.players.length;
            this.match.host.playerCount += 1;
            if (numClients === this.match.host.playerCount) {
                this.match.host.playerCount = 0;
                this.match.host.socket.emit('updatedPlayersPoints', match.getPlayersPointsList());
            }
        });

        this.on('questionOver', () => {
            this.socket.emit('questionOver', false);
        });

        this.on('questionAnswered', (playerTime: number) => {
            this.time = playerTime;
            const playersTimeList = this.match.getPlayersTimeList();
            if (Array.isArray(playersTimeList) && playersTimeList.every((time) => typeof time === 'number')) {
                this.match.toAll('questionAnswered', true);
            }
        });

        this.on('exitMatch', () => {
            this.match.removePlayerFromGame(this);
        });

        this.on('exitWaitRoom', () => {
            this.match.removePlayer(this);
        });

        this.on('playerAnswerIndex', (answerIndex: number[]) => {
            this.match.host.socket.emit('playerAnswerIndex', { player: this.name, answer: answerIndex });
        });

        this.on('wrongAnswer', (answer: boolean) => {
            this.updateTime(answer);
            this.match.toAll('scoreCorrection');
        });
        this.on('qrlTextInputChange', () => {
            this.lastFiveSecQrlTextInputChangeValue = true;
            if (this.resetQrlChangeTimeOut) {
                clearTimeout(this.resetQrlChangeTimeOut);
            }
            this.resetQrlChangeTimeOut = setTimeout(() => {
                this.lastFiveSecQrlTextInputChangeValue = false;
            }, this.timeout);
        });
        this.on('qrlAnswer', (answer: string) => {
            this.qrlAnswerValue = answer;
            this.qrlAnswered = true;
            this.match.checkEveryPlayerHasAnswered();
        });

        this.on('firstInteraction', () => {
            this.match.host.socket.emit('firstInteraction', this.name);
        });

        this.on('enterClick', () => {
            this.match.host.socket.emit('enterClick', this.name);
        });
    }

    get playerBonus(): number {
        return this.bonus;
    }

    get lastFiveSecQrlTextInputChange(): boolean {
        return this.lastFiveSecQrlTextInputChangeValue;
    }
    get qrlAnswer(): string {
        return this.qrlAnswerValue;
    }
    set playerBonus(bonus: number) {
        this.bonus = bonus;
    }
    resetQrl() {
        this.lastFiveSecQrlTextInputChangeValue = false;
        this.qrlAnswered = false;
        this.qrlAnswerValue = '';
    }

    private updatePoints(questionPoints: number, answer: boolean, correction: boolean): boolean {
        const playersTimeList = this.match.getPlayersTimeList();
        if (answer && Math.max(...playersTimeList) === this.time) {
            if (correction) {
                this.points = this.pastPoints;
                this.playerBonus -= 1;
            }
            this.playerBonus += 1;
            this.pastPoints = this.points;
            this.points += questionPoints + questionPoints * BONUS_POINTS;
            this.isFirst = true;
        } else if (answer && Math.max(...playersTimeList) !== this.time) {
            this.pastPoints = this.points;
            this.points += questionPoints;
            this.isFirst = false;
        } else if (!answer) {
            this.isFirst = false;
        }

        return this.isFirst;
    }

    private updateTime(answer: boolean) {
        const playersTimeList = this.match.getPlayersTimeList();
        if (!answer && Math.max(...playersTimeList) === this.time) {
            this.time = 0;
        }
    }
}
