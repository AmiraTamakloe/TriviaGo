import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { QrlState } from '@common/qrlState';
import { Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class QrlCommonService {
    readonly nextButtonActivateSignal: Subject<void> = new Subject<void>();
    private resultsValue: {
        player: string;
        note: number;
    }[] = [];
    private stateValue: number = QrlState.Play;
    constructor(private socketClientService: SocketClientService) {
        this.socketClientService.on('qrlAnsweredByAllPlayers', () => {
            this.stateValue = QrlState.Validate;
        });
        this.socketClientService.on(
            'qrlExaminationDone',
            (
                data: {
                    player: string;
                    note: number;
                }[],
            ) => {
                this.stateValue = QrlState.ViewResults;
                this.nextButtonActivateSignal.next();
                this.results = data;
            },
        );
    }
    get state(): number {
        return this.stateValue;
    }
    get results() {
        return this.resultsValue;
    }
    set results(
        results: {
            player: string;
            note: number;
        }[],
    ) {
        this.resultsValue = results;
    }
    newQrl() {
        this.stateValue = QrlState.Play;
        this.resultsValue = [];
    }
}
