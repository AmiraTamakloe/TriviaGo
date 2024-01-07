/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { MatchTimer } from '@app/classes/match-timer/match-timer';
import { QuestionType } from '@app/interfaces/question';
import {
    COUNTDOWN_DEFAULT_TIME_SECONDS,
    NORMAL_TICK_INTERVAL_MS,
    PANIC_TICK_INTERVAL_MS,
    QCM_PANIC_LIMIT_TIME_SECONDS,
    QRL_DEFAULT_TIME_SECONDS,
    QRL_PANIC_LIMIT_TIME_SECONDS,
    TIME_PRECISION_CONVERSION_FACTOR,
} from '@common/constants';
import { TimerState } from '@common/timer-state';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Server as Sio } from 'socket.io';

describe('MatchTimer', () => {
    let matchTimer: MatchTimer;
    const emitSpy = sinon.spy();
    const sioStub = {
        to: () => ({ emit: emitSpy }) as any,
    } as unknown as Sio;
    beforeEach(() => {
        matchTimer = new MatchTimer(10, sioStub, '0000');
    });

    it('should pause and resume the timer', () => {
        matchTimer.pause();
        expect(matchTimer['state']).to.equal(TimerState.Paused);
        matchTimer.resume();
        expect(matchTimer['state']).to.equal(TimerState.Running);
    });
    it('should start the pre-match countdown', () => {
        matchTimer.startPreMatchCountdown();
        expect(matchTimer['state']).to.equal(TimerState.Running);
        expect(matchTimer['tick']).to.equal(NORMAL_TICK_INTERVAL_MS);
        expect(matchTimer['remainingTime']).to.equal(TIME_PRECISION_CONVERSION_FACTOR * COUNTDOWN_DEFAULT_TIME_SECONDS);
    });

    it('should start a new QCM question', () => {
        matchTimer.startNewQuestion(QuestionType.QCM);
        expect(matchTimer['state']).to.equal(TimerState.Running);
        expect(matchTimer['tick']).to.equal(NORMAL_TICK_INTERVAL_MS);
        expect(matchTimer['remainingTime']).to.equal(TIME_PRECISION_CONVERSION_FACTOR * 10);
        expect(matchTimer['panicLimitTime']).to.equal(TIME_PRECISION_CONVERSION_FACTOR * QCM_PANIC_LIMIT_TIME_SECONDS);
    });

    it('should start a new QRL question', () => {
        matchTimer.startNewQuestion(QuestionType.QRL);
        expect(matchTimer['state']).to.equal(TimerState.Running);
        expect(matchTimer['tick']).to.equal(NORMAL_TICK_INTERVAL_MS);
        expect(matchTimer['remainingTime']).to.equal(TIME_PRECISION_CONVERSION_FACTOR * QRL_DEFAULT_TIME_SECONDS);
        expect(matchTimer['panicLimitTime']).to.equal(TIME_PRECISION_CONVERSION_FACTOR * QRL_PANIC_LIMIT_TIME_SECONDS);
    });

    it('should throw an error for an invalid question type', () => {
        expect(() => matchTimer.startNewQuestion('invalid' as QuestionType)).to.throw('Invalid question type');
    });

    it('should panic if remaining time is less than or equal to panic limit time and panic mode is available', () => {
        matchTimer['remainingTime'] = 5;
        matchTimer['panicLimitTime'] = 6;
        matchTimer['isPanicModeAvailable'] = true;
        matchTimer.panic();
        expect(matchTimer['tick']).to.equal(PANIC_TICK_INTERVAL_MS);
        expect(matchTimer['isPanicModeAvailable']).to.be.false;
        expect(matchTimer['state']).to.equal(TimerState.Running);
    });

    it('should not panic if remaining time is greater than panic limit time', () => {
        matchTimer['remainingTime'] = 7;
        matchTimer['panicLimitTime'] = 6;
        matchTimer.panic();
        expect(matchTimer['tick']).to.equal(NORMAL_TICK_INTERVAL_MS);
    });

    it('should not panic if panic mode is not available', () => {
        matchTimer['remainingTime'] = 5;
        matchTimer['panicLimitTime'] = 6;
        matchTimer['isPanicModeAvailable'] = false;
        matchTimer.panic();
        expect(matchTimer['tick']).to.equal(NORMAL_TICK_INTERVAL_MS);
        expect(matchTimer['isPanicModeAvailable']).to.be.false;
        expect(matchTimer['state']).to.equal(TimerState.Paused);
    });

    it('should start the timer', () => {
        matchTimer['remainingTime'] = 5;
        matchTimer['panicLimitTime'] = 4;
        matchTimer['state'] = TimerState.Running;
        matchTimer.startNewQuestion(QuestionType.QCM);
        matchTimer['startTimer']();
        expect(matchTimer['state']).to.equal(TimerState.Running);
        expect(matchTimer['interval']).to.not.be.undefined;
    });

    it('should emit matchTimer event if remaining time is greater than or equal to 0 and state is running', () => {
        matchTimer['remainingTime'] = 5;
        matchTimer['state'] = TimerState.Running;
        matchTimer['startTimer']();
    });

    it('should emit matchTimer event if remaining time is greater than or equal to 0 and state is running', () => {
        matchTimer['remainingTime'] = 5;
        matchTimer['state'] = TimerState.Running;
        matchTimer['startTimer']();
    });

    it('should emit timeIsUp event and clear the interval if remaining time is equal to 0', () => {
        matchTimer['remainingTime'] = 0;
        matchTimer['interval'] = setInterval(() => {}, 1000);
        matchTimer['startTimer']();
    });
    it('should emit matchTimer event if remaining time is greater than or equal to 0 and state is running', () => {
        matchTimer['remainingTime'] = 5;
        matchTimer['state'] = TimerState.Running;
        matchTimer['startTimer']();
    });

    it('should set isPanicModeAvailable to true and emit enablePanicOption event if remaining time is equal to panic limit time', () => {
        matchTimer['remainingTime'] = 3;
        matchTimer['panicLimitTime'] = 3;
        matchTimer['startTimer']();
    });

    it('should emit timeIsUp event and clear interval if remaining time is equal to 0', () => {
        matchTimer['remainingTime'] = 0;
        matchTimer['interval'] = setInterval(() => {}, 1000);
        matchTimer['startTimer']();
    });
    it('should set isPanicModeAvailable to true and emit enablePanicOption event', () => {
        matchTimer['enablePanicOption']();
        expect(matchTimer['isPanicModeAvailable']).to.be.true;
    });
    it('should emit panic false when pausing if timer is in panic mode', () => {
        matchTimer['tick'] = PANIC_TICK_INTERVAL_MS;
        matchTimer['pause']();
        expect(emitSpy.calledWith('panic', false)).to.be.true;
    });
    it('should emit panic true when resuming if timer is in panic mode', () => {
        matchTimer['tick'] = PANIC_TICK_INTERVAL_MS;
        matchTimer['resume']();
        expect(emitSpy.calledWith('panic', true)).to.be.true;
    });
});
