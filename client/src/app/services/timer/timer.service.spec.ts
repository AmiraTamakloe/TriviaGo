import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { TimerService } from './timer.service';
describe('TimerService', () => {
    let service: TimerService;
    let socketHelper: SocketTestHelper;
    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        TestBed.configureTestingModule({
            providers: [{ provide: SocketClientService, useValue: socketHelper }],
        });
        service = TestBed.inject(TimerService);
    });
    it('should create', () => {
        expect(service).toBeTruthy();
    });
    it('should set remaining time', () => {
        const remainingTime = 10.5;
        service['setRemainingTime'](remainingTime);
        expect(service.remainingTime).toBe('10.5');
    });
    it('should set remaining time when matchTimer event is received', () => {
        const remainingTime = 10.5;
        socketHelper.peerSideEmit('matchTimer', remainingTime);
        expect(service.remainingTime).toBe('10.5');
    });
    it('should send stopTimer event when stop is called', () => {
        const spy = spyOn(socketHelper, 'send');
        service.stop();
        expect(spy).toHaveBeenCalledWith('stopTimer');
    });
});
