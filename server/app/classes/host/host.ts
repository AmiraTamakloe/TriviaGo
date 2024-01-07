import DbGameFinder from '@app/classes/db-game-finder/db-game-finder';
import { MatchTimer } from '@app/classes/match-timer/match-timer';
import Match from '@app/classes/match/match';
import User from '@app/classes/user/user';
import { History } from '@app/interfaces/history';
import { QuestionType } from '@app/interfaces/question';
import { EMIT_MIN_INTERVAL, HOST_NAME } from '@common/constants';
import { Histogram } from '@common/histogram';
import { Result } from '@common/results';
import { TimerControl } from '@common/timer-state';
import { Socket } from 'socket.io';
export default class Host extends User {
    timer: MatchTimer;
    playerCount: number = 0;
    matchHistory: History[] = [];
    private interval: NodeJS.Timeout;

    constructor(
        readonly socket: Socket,
        readonly matchId: string,
        readonly match: Match,
    ) {
        super(socket, matchId, HOST_NAME, match);
        this.timer = new MatchTimer(this.match.game.duration, this.match.sio, this.matchId);
        super.init();
        this.on('matchAboutToStart', async () => {
            try {
                await DbGameFinder.findById(this.match.game.id);
                this.match.toAll('matchAboutToStart');
                this.match.hasStarted = true;
                this.timer.startPreMatchCountdown();
            } catch (e) {
                this.match.toAll('gameNotFound');
                this.match.selfDestructor();
            }
        });

        this.on<boolean>('changeLockState', (lockState: boolean) => {
            this.changeLockState(lockState);
        });

        this.on<string>('banPlayer', (playerId) => {
            this.match.banPlayer(playerId);
        });
        this.on('getPlayersPoints', () => {
            if (this.matchHistory.length > 0) {
                this.matchHistory.pop();
            }
            this.matchHistory.push({
                gameName: this.match.game.title,
                date: new Date()
                    .toLocaleString('fr-CA', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                    })
                    .replace(/(\d{2})\s?h\s?(\d{2})\s?min\s?(\d{2})\s?s/, '$1:$2:$3'),
                playersNumber: this.match.getPlayersPointsList().length,
                bestScore: 0,
            });
            this.socket.emit('updatedPlayersPoints', this.match.getPlayersPointsList());
        });

        this.on('getPlayersBonus', () => {
            this.socket.emit('updatedPlayersBonus', this.match.getPlayersBonusList());
        });

        this.on('getPlayersList', () => {
            this.socket.emit('updatedPlayersList', this.match.getPlayersNameList());
        });

        this.on('questionOver', () => {
            this.match.setPlayersTimeToNull();
            this.match.toAll('questionOver', false);
        });

        this.on('questionTimer', (type: string) => {
            if (type === QuestionType.QCM) {
                this.timer.startNewQuestion(QuestionType.QCM);
            } else {
                this.timer.startNewQuestion(QuestionType.QRL);
            }
        });

        this.on('stopTimer', () => {
            this.timer.pause();
        });

        this.on('questionAnswered', () => {
            const playersTimeList = this.match.getPlayersTimeList();
            if (Array.isArray(playersTimeList) && playersTimeList.every((time) => time != null)) {
                this.timer.pause();
                this.match.toAll('questionAnswered', true);
            }
        });

        this.on('mutePlayer', (player: string) => {
            this.match.mutePlayer(player);
        });

        this.on('unmutePlayer', (player: string) => {
            this.match.unmutePlayer(player);
        });

        this.socket.once('exitMatch', (callback) => {
            this.match.toAll('matchCanceled');
            this.match.selfDestructor();
            callback({});
        });

        this.socket.once('exitWaitRoom', (callback) => {
            this.match.toAll('matchCanceled');
            this.match.selfDestructor();
            callback({});
        });

        this.socket.once('disconnect', () => {
            this.match.toAll('matchCanceled');
            this.match.selfDestructor();
        });

        this.on('finalResultsForAll', () => {
            // eslint-disable-next-line prefer-const
            let finalResults: Result[] = [];
            for (const player of this.match.players) {
                const res: Result = { name: player.name, points: player.points, bonus: player.bonus };
                finalResults.push(res);
            }
            if (this.matchHistory[0]) {
                this.matchHistory[0].bestScore = Math.max(...this.match.getPlayersPointsList());
            }
            this.socket.emit('gameHistory', this.matchHistory);
            this.match.toAll('displayFinalResults', finalResults);
        });

        this.on('timerControl', (command: string) => {
            switch (command) {
                case TimerControl.resume:
                    this.timer.resume();
                    break;
                case TimerControl.pause:
                    this.timer.pause();
                    break;
                case TimerControl.panic:
                    this.timer.panic();
                    break;
            }
        });

        this.on('histogramsSent', (data: { histograms: Histogram[]; questions: string[] }) => {
            this.match.toAll('histogramsForResult', data);
        });
        this.on('newQrl', () => {
            this.match.resetQrlAnswers();
            this.sendQrlRecentChangesToClient();
        });
        this.on('qrlExaminationDone', (data: { results: { player: string; note: number }[]; questionNumber: number }) => {
            for (const res of data.results) {
                const qrlPoints = this.match.game.questions[data.questionNumber].points * res.note;
                const player = this.match.players.find((playerToFind) => playerToFind.name === res.player);
                player.points += qrlPoints;
            }
            this.match.toAll('qrlExaminationDone', data.results);
            this.socket.emit('updatedPlayersPoints', this.match.getPlayersPointsList());
            this.match.players.forEach((player) => {
                player.socket.emit('updatedPlayersPoints', [player.points, player.pastPoints]);
            });
        });
        this.on('getPointsMap', () => {
            this.match.getPlayersPointsMap();
        });
    }
    changeLockState(lockState: boolean) {
        this.match.isLocked = lockState;
    }
    sendQrlRecentChangesToClient() {
        this.interval = setInterval(() => {
            const nRecentChanges = this.match.players.filter((player) => player.lastFiveSecQrlTextInputChange).length;
            this.socket.emit('qrlRecentChanges', {
                nRecentChanges,
                nPlayers: this.match.players.length,
            });
        }, EMIT_MIN_INTERVAL);
    }
    stopSendRecentChangesToClient() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}
