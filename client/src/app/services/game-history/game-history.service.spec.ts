import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { History } from '@app/interfaces/history';
import { GameHistoryService } from './game-history.service';

describe('GameHistoryService', () => {
    let service: GameHistoryService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [GameHistoryService],
        });

        service = TestBed.inject(GameHistoryService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch all games', () => {
        const dummyHistory: History[] = [
            {
                gameName: 'Cedrick test',
                date: '11/9/2023',
                playersNumber: 2,
                bestScore: 60,
            },
        ];
        service.fetchGameHistory().subscribe((history) => {
            expect(history).toEqual(dummyHistory);
        });

        const req = httpTestingController.expectOne(`${service['baseURL']}/history`);
        expect(req.request.method).toBe('GET');
        req.flush(dummyHistory);
    });

    it('should post history', () => {
        const history: History = {
            gameName: 'Cedrick test',
            date: '11/9/2023',
            playersNumber: 2,
            bestScore: 60,
        };
        service.postGameHistory(history).subscribe((response) => {
            expect(response).toBeTruthy();
        });
        const req = httpTestingController.expectOne(`${service['baseURL']}/history`);
        expect(req.request.method).toBe('POST');
        req.flush({ success: true });
    });

    it('should send a DELETE request to the correct URL', () => {
        service.removeGameHistory();

        const req = httpTestingController.expectOne(`${service['baseURL']}/history`);
        expect(req.request.method).toBe('DELETE');
        req.flush({ success: true });
    });
});
