/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QrlPlayerComponent } from './qrl-player.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';
import { Component, EventEmitter } from '@angular/core';
import { QrlTextBoxComponent } from '@app/components/qrl-text-box/qrl-text-box.component';
@Component({
    selector: 'app-qrl-text-box',
    template: '',
})
class QrlTextBoxStubComponent {
    textInputValueChange = new EventEmitter();
    textInputValue = 'test';
}
describe('QrlPlayerComponent', () => {
    let component: QrlPlayerComponent;
    let fixture: ComponentFixture<QrlPlayerComponent>;
    let matchQuestionManagementServiceSpy: jasmine.SpyObj<MatchQuestionManagementService>;

    beforeEach(() => {
        matchQuestionManagementServiceSpy = jasmine.createSpyObj('MatchQuestionManagementService', [], {
            time: '0',
            qrlAnswered: new EventEmitter(),
            nextQuestion: new EventEmitter(),
        });

        TestBed.configureTestingModule({
            declarations: [QrlPlayerComponent, QrlTextBoxStubComponent],
            imports: [MatSnackBarModule],
            providers: [
                { provide: MatchQuestionManagementService, useValue: matchQuestionManagementServiceSpy },
                {
                    provide: QrlTextBoxComponent,
                    useValue: {
                        textInputValueChange: {
                            subscribe: jasmine.createSpy('subscribe'),
                        },
                    },
                },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(QrlPlayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should call submit answer whe qrlAnswered is triggered by the matchQuestionManagementService', () => {
        const spy = spyOn<any>(component, 'submitAnswer');
        matchQuestionManagementServiceSpy.qrlAnswered.emit();
        expect(spy).toHaveBeenCalled();
    });
    it('should call reset whe nextQuestion is triggered by the matchQuestionManagementService', () => {
        const spy = spyOn<any>(component, 'reset');
        matchQuestionManagementServiceSpy.nextQuestion.emit();
        expect(spy).toHaveBeenCalled();
    });
    it('should call socket.send when qrlTextBox.textInputValueChange is triggered', () => {
        spyOn(component['socket'], 'send');
        component['qrlTextBox'].textInputValueChange.emit();
        expect(component['socket'].send).toHaveBeenCalledWith('qrlTextInputChange');
    });
    it('should send answer to server when submitAnswer is called and was not already submitted', () => {
        spyOn(component['socket'], 'send');
        component['reset']();
        component['submitAnswer']();
        expect(component['answerSubmitted']).toBeTrue();
    });
    it('should not send answer to server when submitAnswer is called and was already submitted', () => {
        spyOn(component['socket'], 'send');
        component['answerSubmitted'] = true;
        component['submitAnswer']();
        expect(component['socket'].send).not.toHaveBeenCalled();
    });
    it('should call submitAnswer when timeIsUpListener is triggered', () => {
        const spy = spyOn<any>(component, 'submitAnswer');
        component['timeIsUpListener']();
        expect(spy).toHaveBeenCalled();
    });
});
