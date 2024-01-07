import { Component } from '@angular/core';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { TimerState, TimerControl } from '@common/timer-state';

export enum TimerToggleButtonText {
    Pause = 'Pause',
    Resume = 'Jouer',
}
enum TimerToggleButtonSymbol {
    Pause = '⏸',
    Resume = '▶',
}

@Component({
    selector: 'app-timer-control',
    templateUrl: './timer-control.component.html',
    styleUrls: ['./timer-control.component.scss'],
})
export class TimerControlComponent {
    isPanicModeAvailable = false;
    timerToggleButtonText: TimerToggleButtonText;
    timerToggleButtonIcon: TimerToggleButtonSymbol;
    private timerState = TimerState.Running;

    constructor(
        private socketClientService: SocketClientService,
        readonly matchQuestionManagementService: MatchQuestionManagementService,
    ) {
        this.setTimerToggleButtonText();
        this.socketClientService.removeAllListeners('enablePanicOption');
        this.socketClientService.on('enablePanicOption', (enable: boolean) => {
            this.isPanicModeAvailable = enable;
        });
        this.matchQuestionManagementService.resetTimerControls.subscribe(() => {
            this.timerState = TimerState.Running;
            this.setTimerToggleButtonText();
        });
    }

    panic() {
        this.isPanicModeAvailable = false;
        this.socketClientService.send('timerControl', TimerControl.panic);
    }

    toggleTimerState() {
        if (this.timerState === TimerState.Paused) {
            this.timerState = TimerState.Running;
        } else if (this.timerState === TimerState.Running) {
            this.timerState = TimerState.Paused;
        }
        this.setTimerToggleButtonText();
        this.setTimerState();
    }

    private setTimerState() {
        if (this.timerState === TimerState.Paused) {
            this.socketClientService.send('timerControl', TimerControl.pause);
        } else if (this.timerState === TimerState.Running) {
            this.socketClientService.send('timerControl', TimerControl.resume);
        }
    }

    private setTimerToggleButtonText() {
        if (this.timerState === TimerState.Paused) {
            this.timerToggleButtonText = TimerToggleButtonText.Resume;
            this.timerToggleButtonIcon = TimerToggleButtonSymbol.Resume;
        } else if (this.timerState === TimerState.Running) {
            this.timerToggleButtonText = TimerToggleButtonText.Pause;
            this.timerToggleButtonIcon = TimerToggleButtonSymbol.Pause;
        }
    }
}
