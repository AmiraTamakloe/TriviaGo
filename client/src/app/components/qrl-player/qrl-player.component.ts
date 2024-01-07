import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { QrlTextBoxComponent } from '@app/components/qrl-text-box/qrl-text-box.component';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';
import { QrlCommonService } from '@app/services/qrl-common/qrl-common.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { QrlState } from '@common/qrlState';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-qrl-player',
    templateUrl: './qrl-player.component.html',
    styleUrls: ['./qrl-player.component.scss'],
})
export class QrlPlayerComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('qrlTextBox') qrlTextBox: QrlTextBoxComponent;
    interval: number | undefined;
    protected qrlState = QrlState;
    private subscriptions: Subscription[] = [];
    private answerSubmitted: boolean = false;
    constructor(
        readonly qrlCommonService: QrlCommonService,
        private socket: SocketClientService,
        private matchQuestionManagementService: MatchQuestionManagementService,
    ) {}

    ngOnInit() {
        this.reset();
        this.socket.on('timeIsUp', this.timeIsUpListener);
        this.subscriptions.push(
            this.matchQuestionManagementService.qrlAnswered.subscribe(() => {
                this.submitAnswer();
            }),
            this.matchQuestionManagementService.nextQuestion.subscribe(() => {
                this.reset();
            }),
        );
    }
    ngAfterViewInit() {
        this.subscriptions.push(
            this.qrlTextBox.textInputValueChange.subscribe(() => {
                this.socket.send('qrlTextInputChange');
            }),
        );
    }

    ngOnDestroy(): void {
        this.socket.socket.off('timeIsUp', this.timeIsUpListener);
        this.subscriptions.forEach((sub) => {
            sub.unsubscribe();
        });
    }

    private submitAnswer() {
        if (!this.answerSubmitted) {
            this.socket.send('qrlAnswer', this.qrlTextBox.textInput);
            this.answerSubmitted = true;
        }
    }

    private reset() {
        this.answerSubmitted = false;
    }

    private timeIsUpListener = () => {
        this.submitAnswer();
    };
}
