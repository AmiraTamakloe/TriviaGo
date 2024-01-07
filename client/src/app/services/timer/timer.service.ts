import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    private remainingTimeValue: string;

    constructor(private socketClientService: SocketClientService) {
        this.socketClientService.on<number>('matchTimer', (remainingTime) => {
            this.setRemainingTime(remainingTime);
        });
    }
    get remainingTime(): string {
        return this.remainingTimeValue;
    }
    stop() {
        this.socketClientService.send('stopTimer');
    }
    start(type: string) {
        this.socketClientService.send('questionTimer', type);
    }
    private setRemainingTime(time: number) {
        this.remainingTimeValue = time.toFixed(1);
    }
}
