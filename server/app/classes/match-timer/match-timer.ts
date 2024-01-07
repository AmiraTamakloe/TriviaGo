import { QuestionType } from '@app/interfaces/question';
import { TimerState } from '@common/timer-state';
import { Server as Sio } from 'socket.io';
import {
    QCM_PANIC_LIMIT_TIME_SECONDS,
    QRL_PANIC_LIMIT_TIME_SECONDS,
    QRL_DEFAULT_TIME_SECONDS,
    COUNTDOWN_DEFAULT_TIME_SECONDS,
    NORMAL_TICK_INTERVAL_MS,
    TIME_PRECISION_CONVERSION_FACTOR,
    PANIC_TICK_INTERVAL_MS,
} from '@common/constants';

export class MatchTimer {
    private remainingTime: number;
    private panicLimitTime: number;
    private tick: number = NORMAL_TICK_INTERVAL_MS;
    private state = TimerState.Paused;
    private interval: NodeJS.Timeout;
    private isPanicModeAvailable = false;

    constructor(
        private qcmTimeToAnswer: number,
        private sio: Sio,
        private matchId: string,
    ) {}

    startNewQuestion(questionType: QuestionType) {
        this.pause();
        this.tick = NORMAL_TICK_INTERVAL_MS;
        if (questionType === QuestionType.QCM) {
            this.remainingTime = TIME_PRECISION_CONVERSION_FACTOR * this.qcmTimeToAnswer;
            this.panicLimitTime = TIME_PRECISION_CONVERSION_FACTOR * QCM_PANIC_LIMIT_TIME_SECONDS;
        } else if (questionType === QuestionType.QRL) {
            this.remainingTime = TIME_PRECISION_CONVERSION_FACTOR * QRL_DEFAULT_TIME_SECONDS;
            this.panicLimitTime = TIME_PRECISION_CONVERSION_FACTOR * QRL_PANIC_LIMIT_TIME_SECONDS;
        } else {
            throw new Error('Invalid question type');
        }
        if (this.remainingTime <= this.panicLimitTime) {
            this.enablePanicOption();
        } else {
            this.enablePanicOption(false);
        }

        this.startTimer();
    }

    startPreMatchCountdown() {
        this.pause();
        this.tick = NORMAL_TICK_INTERVAL_MS;
        this.remainingTime = TIME_PRECISION_CONVERSION_FACTOR * COUNTDOWN_DEFAULT_TIME_SECONDS;
        this.startTimer();
    }

    pause() {
        this.state = TimerState.Paused;
        if (this.tick === PANIC_TICK_INTERVAL_MS) {
            this.sio.to(this.matchId).emit('panic', false);
        }
    }

    resume() {
        if (this.tick === PANIC_TICK_INTERVAL_MS) {
            this.sio.to(this.matchId).emit('panic', true);
        }
        this.state = TimerState.Running;
    }

    panic() {
        if (this.remainingTime <= this.panicLimitTime && this.isPanicModeAvailable) {
            this.tick = PANIC_TICK_INTERVAL_MS;
            this.isPanicModeAvailable = false;
            this.startTimer();
            this.sio.to(this.matchId).emit('panic', true);
        }
    }

    private enablePanicOption(enable: boolean = true) {
        this.isPanicModeAvailable = enable;
        this.sio.to(this.matchId).emit('enablePanicOption', enable);
    }

    private timeIsUp() {
        this.sio.to(this.matchId).emit('timeIsUp');
        this.sio.to(this.matchId).emit('panic', false);
    }

    private async startTimer() {
        this.state = TimerState.Running;
        if (this.interval) {
            clearInterval(this.interval);
        }

        this.interval = setInterval(() => {
            if (this.remainingTime > 0 && this.state === TimerState.Running) {
                this.sio.to(this.matchId).emit('matchTimer', --this.remainingTime / TIME_PRECISION_CONVERSION_FACTOR);
                if (this.remainingTime === this.panicLimitTime) {
                    this.enablePanicOption();
                }
                if (this.remainingTime === 0) {
                    this.tick = NORMAL_TICK_INTERVAL_MS;
                    this.timeIsUp();
                }
            }
        }, this.tick);
    }
}
