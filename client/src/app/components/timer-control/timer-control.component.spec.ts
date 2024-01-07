import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { TimerControlComponent, TimerToggleButtonText } from './timer-control.component';
import { By } from '@angular/platform-browser';
import { TimerState } from '@common/timer-state';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';
import { EventEmitter } from '@angular/core';

describe('TimerControlComponent', () => {
    let component: TimerControlComponent;
    let fixture: ComponentFixture<TimerControlComponent>;
    let socket: SocketTestHelper;
    let matchQuestionManagementServiceSpy: jasmine.SpyObj<MatchQuestionManagementService>;
    beforeEach(() => {
        socket = new SocketTestHelper();
        matchQuestionManagementServiceSpy = jasmine.createSpyObj('MatchQuestionManagementService', [], {
            resetTimerControls: new EventEmitter<boolean>(true),
            timerControlsEnabled: true,
        });

        TestBed.configureTestingModule({
            declarations: [TimerControlComponent],
            providers: [
                { provide: SocketClientService, useClass: SocketTestHelper },
                { provide: MatchQuestionManagementService, useValue: matchQuestionManagementServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TimerControlComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        socket = TestBed.inject(SocketClientService) as unknown as SocketTestHelper;
    });

    it('should start in running state and panic mode disabled', () => {
        expect(component).toBeTruthy();
        expect(component['timerState']).toBe(TimerState.Running);
        expect(component['isPanicModeAvailable']).toBeFalse();
    });

    it('should display pause message on start', () => {
        expect(component.timerToggleButtonText).toBe(TimerToggleButtonText.Pause);
    });

    it('should toggle timer state when button is clicked', () => {
        const button = fixture.debugElement.query(By.css('#timerToggleButton')).nativeElement;
        button.click();
        expect(component['timerState']).toBe(TimerState.Paused);
        expect(component.timerToggleButtonText).toBe(TimerToggleButtonText.Resume);
        button.click();
        expect(component['timerState']).toBe(TimerState.Running);
        expect(component.timerToggleButtonText).toBe(TimerToggleButtonText.Pause);
    });

    it('should disable panic mode', () => {
        component.isPanicModeAvailable = true;
        component.panic();
        expect(component.isPanicModeAvailable).toBeFalse();
    });

    it('should enable panic mode on server call', () => {
        socket.peerSideEmit('enablePanicOption', true);
        expect(component.isPanicModeAvailable).toBeTrue();
    });

    it('should set timerstate to running on resetTimerControls', () => {
        matchQuestionManagementServiceSpy.resetTimerControls.emit();
        expect(component['timerState']).toEqual(TimerState.Running);
    });
});
