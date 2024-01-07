/* eslint-disable @typescript-eslint/no-empty-function */
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { HistogramInfoService } from '@app/services/histogram-info/histogram-info.service';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { QrlHostService } from './qrl-host.service';
describe('QrlHostService', () => {
    let socketHelper: SocketTestHelper;
    let service: QrlHostService;
    let histogramInfoServiceSpy: jasmine.SpyObj<HistogramInfoService>;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        histogramInfoServiceSpy = jasmine.createSpyObj('HistogramInfoService', ['updateQrlValue']);
        TestBed.configureTestingModule({
            providers: [
                { provide: SocketClientService, useValue: socketHelper },
                { provide: HistogramInfoService, useValue: histogramInfoServiceSpy },
                {
                    provide: MatchQuestionManagementService,
                    useValue: {
                        questionNumber: 1,
                        setNextButtonVisible: () => {},
                    },
                },
            ],
            imports: [MatSnackBarModule],
        }).compileComponents();
        service = TestBed.inject(QrlHostService);
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should set nrecentchanges and nplayers on qrlRecentChages', () => {
        const nRecentChanges = 5;
        const nPlayers = 10;
        socketHelper.peerSideEmit('qrlRecentChanges', { nRecentChanges, nPlayers });
        expect(service.nRecentChanges).toBe(nRecentChanges);
        expect(service.nPlayers).toBe(nPlayers);
    });
    it('should set answers and reset eval material on qrlAnswers', () => {
        const answers = [
            { player: 'p1', answer: 'a' },
            { player: 'p2', answer: 'b' },
            { player: 'p3', answer: 'c' },
        ];
        socketHelper.peerSideEmit('qrlAnswers', answers);
        expect(service.answers).toBe(answers);
        expect(service.evalIndex).toBe(0);
        expect(service.results).toEqual([]);
    });
    it('should send qrlExaminationDone when all answers have been evaluated', () => {
        const spy = spyOn(socketHelper, 'send');
        const nextButtonSpy = spyOn(service['matchQuestionManagementService'], 'setNextButtonVisible');
        const answers = [
            { player: 'p1', answer: 'a' },
            { player: 'p2', answer: 'b' },
            { player: 'p3', answer: 'c' },
        ];
        const note = 1;
        service['evalIndexValue'] = 0;
        service['answersValue'] = answers;
        while (service.evalIndex < answers.length) {
            service.submitEval(note);
        }
        expect(spy).toHaveBeenCalled();
        expect(nextButtonSpy).toHaveBeenCalled();
    });
});
