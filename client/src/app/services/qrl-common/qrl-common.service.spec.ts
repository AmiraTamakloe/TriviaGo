import { TestBed } from '@angular/core/testing';
import { QrlCommonService } from './qrl-common.service';
import { QrlState } from '@common/qrlState';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';

describe('QrlCommonService', () => {
    let service: QrlCommonService;
    let socketHelper: SocketTestHelper;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();

        TestBed.configureTestingModule({
            providers: [{ provide: SocketClientService, useValue: socketHelper }],
        });
        service = TestBed.inject(QrlCommonService);
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should set state to Play on newQrl', () => {
        service['stateValue'] = QrlState.ViewResults;
        service.newQrl();
        expect(service.state).toBe(QrlState.Play);
    });
    it('should set state to Validate on qrlAnsweredByAllPlayers', () => {
        service['stateValue'] = QrlState.Play;
        socketHelper.peerSideEmit('qrlAnsweredByAllPlayers');
        expect(service.state).toBe(QrlState.Validate);
    });
    it('should set state to ViewResults on qrlExaminationDone', () => {
        service['stateValue'] = QrlState.Play;
        socketHelper.peerSideEmit('qrlExaminationDone');
        expect(service.state).toBe(QrlState.ViewResults);
    });
});
