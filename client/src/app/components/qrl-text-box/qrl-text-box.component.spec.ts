import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';
import { EMIT_MIN_INTERVAL, MAX_LENGTH_MESSAGE } from '@common/constants';
import { QrlTextBoxComponent } from './qrl-text-box.component';

describe('QrlTextBoxComponent', () => {
    let component: QrlTextBoxComponent;
    let fixture: ComponentFixture<QrlTextBoxComponent>;
    let matchQuestionManagementServiceSpy: jasmine.SpyObj<MatchQuestionManagementService>;

    beforeEach(() => {
        matchQuestionManagementServiceSpy = jasmine.createSpyObj(
            'MatchQuestionManagementService',
            ['questionOver', 'isQcm', 'newMatch', 'startTimer', 'enterClick', 'firstInteraction', 'playerAnswerIndex'],
            {
                questionType: 'QRL',
                nextQuestion: new EventEmitter(),
                answerResult: new EventEmitter<boolean>(false),
                qrlAnswered: new EventEmitter<void>(),
                timeIsUp: new EventEmitter<void>(),
                resetTimerControls: new EventEmitter<void>(),
            },
        );
        TestBed.configureTestingModule({
            declarations: [QrlTextBoxComponent],
            imports: [FormsModule, MatSnackBarModule],
            providers: [{ provide: MatchQuestionManagementService, useValue: matchQuestionManagementServiceSpy }],
        }).compileComponents();
        fixture = TestBed.createComponent(QrlTextBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('countCharacters should set characterCount to the right count when inserting', () => {
        const textInput = 'test';
        const event = {
            target: {
                value: textInput,
            },
        } as unknown as Event;

        component.countCharacters(event);
        expect(component['characterCount']).toEqual(textInput.length);
    });

    it('countCharacters should max out at 200 characters', () => {
        const event = {
            target: {
                value:
                    'abcdefghijklmnopqrstuvwxyz' + // 26
                    'abcdefghijklmnopqrstuvwxyz' + // 52
                    'abcdefghijklmnopqrstuvwxyz' + // 78
                    'abcdefghijklmnopqrstuvwxyz' + // 104
                    'abcdefghijklmnopqrstuvwxyz' + // 130
                    'abcdefghijklmnopqrstuvwxyz' + // 156
                    'abcdefghijklmnopqrstuvwxyz' + // 182
                    'abcdefghijklmnopqrstuvwxyz', // 208
            },
        } as unknown as Event;
        matchQuestionManagementServiceSpy.firstInteraction();
        component['countCharacters'](event);
        expect(component['characterCount']).toEqual(MAX_LENGTH_MESSAGE);
        expect(component['charCountColor']).toEqual('red');
    });

    it('reset should reset the textInputValue', () => {
        component['textInputValue'] = 'test';
        component.reset();
        expect(component.textInput).toEqual('');
    });
    it('reset should reset when matchQuestionManagementService triggers nextQuestion', () => {
        component['textInputValue'] = 'test';
        matchQuestionManagementServiceSpy.nextQuestion.emit(true);
        expect(component.textInput).toEqual('');
    });
    it('reset should set textBoxDisabled to true when qrl is answered (the validate button is located in button component)', () => {
        component['match'].qrlAnswered.emit();
        expect(component['textBoxDisabled']).toEqual(true);
    });

    it('should set emitDisabled to false after a delay', fakeAsync(() => {
        component['emitDisabled'] = false;
        component.countCharacters({ target: { value: 'test' } } as unknown as Event);
        tick(EMIT_MIN_INTERVAL);
        expect(component['emitDisabled']).toEqual(false);
    }));
});
