import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';
import { EMIT_MIN_INTERVAL, MAX_LENGTH_MESSAGE } from '@common/constants';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-qrl-text-box',
    templateUrl: './qrl-text-box.component.html',
    styleUrls: ['./qrl-text-box.component.scss'],
})
export class QrlTextBoxComponent implements OnInit, OnDestroy {
    readonly textInputValueChange: EventEmitter<void> = new EventEmitter<void>();
    protected textInputValue: string = '';
    protected characterCount = 0;
    protected charCountColor = 'black';
    protected textBoxDisabled: boolean = false;
    private sub: Subscription[] = [];
    private emitDisabled: boolean = false;
    private isFirstInteractionDone: boolean = false;
    constructor(private match: MatchQuestionManagementService) {}

    get textInput(): string {
        return this.textInputValue;
    }
    ngOnInit(): void {
        this.sub.push(
            this.match.nextQuestion.subscribe(() => {
                this.reset();
            }),
            this.match.qrlAnswered.subscribe(() => {
                this.textBoxDisabled = true;
            }),
        );
    }

    ngOnDestroy(): void {
        this.sub.forEach((sub) => {
            sub.unsubscribe();
        });
    }
    countCharacters(event: Event): void {
        if (!this.isFirstInteractionDone) {
            this.match.firstInteraction();
            this.isFirstInteractionDone = true;
        }
        const inputValue: string = (event.target as HTMLInputElement).value;
        this.characterCount = inputValue.length;
        if (this.characterCount >= MAX_LENGTH_MESSAGE) {
            this.charCountColor = 'red';
            (event.target as HTMLInputElement).value = inputValue.substring(0, MAX_LENGTH_MESSAGE);
            this.characterCount = 200;
        } else {
            this.charCountColor = 'black';
        }
        if (!this.emitDisabled) {
            this.textInputValueChange.emit();
            this.emitDisabled = true;
            setTimeout(() => {
                this.emitDisabled = false;
            }, EMIT_MIN_INTERVAL);
        }
    }
    reset() {
        this.isFirstInteractionDone = false;
        this.textInputValue = '';
        this.textBoxDisabled = false;
    }
}
