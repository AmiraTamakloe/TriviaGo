import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormValidationService } from './form-validation.service';

describe('FormValidationService', () => {
    let service: FormValidationService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [FormValidationService],
        });
        service = TestBed.inject(FormValidationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should post game data with transformed values', () => {
        const date: Date = new Date();
        const mockGame = {
            duration: '10',
            lastModification: date.toISOString(),
            questions: [
                {
                    points: '20',
                    choices: [
                        { text: 'Amz', isCorrect: true },
                        { text: 'Tamz', isCorrect: false },
                    ],
                },
            ],
        };

        service.postGame(mockGame).subscribe((response) => {
            expect(response).toBeTruthy();
        });
        const req = httpMock.expectOne(`${service.baseURL}/createMatch`);
        expect(req.request.method).toBe('POST');
        req.flush({ success: true });
    });

    it('should patch game data with transformed values', () => {
        const date: Date = new Date();
        const mockGame = {
            id: 'matteo',
            duration: '10',
            lastModification: date.toISOString(),
            questions: [
                {
                    points: '20',
                    choices: [
                        { text: 'Amz', isCorrect: true },
                        { text: 'Tamz', isCorrect: false },
                    ],
                },
            ],
        };

        service.patchGame(mockGame, mockGame.id).subscribe((response) => {
            expect(response).toBeTruthy();
        });
        const req = httpMock.expectOne(`${service.baseURL}/createMatch/${mockGame.id}`);
        expect(req.request.method).toBe('PATCH');
        req.flush({ success: true });
    });

    it('should upload a game', () => {
        const date: Date = new Date();
        const mockGame = {
            id: 'matteo',
            duration: '10',
            lastModification: date.toISOString(),
            questions: [
                {
                    points: '20',
                    choices: [
                        { text: 'Amz', isCorrect: true },
                        { text: 'Tamz', isCorrect: false },
                    ],
                },
            ],
        };
        const expectedGame = {
            id: 'matteo',
            lastModification: date.toISOString(),
            duration: 10,
            questions: [
                {
                    points: 20,
                    choices: [
                        { text: 'Amz', isCorrect: true },
                        { text: 'Tamz', isCorrect: false },
                    ],
                },
            ],
        };
        service.uploadGame(mockGame).subscribe((response) => {
            expect(response).toEqual(expectedGame);
        });

        const req = httpMock.expectOne(service.baseURL + '/createMatch?isJson=true');
        expect(req.request.method).toBe('POST');
        expect(req.request.params.get('isJson')).toBe('true');

        req.flush(expectedGame);
    });

    it('should delete choices for QRL questions', () => {
        const date: Date = new Date();
        const mockGame = {
            duration: '10',
            lastModification: date.toISOString(),
            questions: [
                {
                    type: 'QRL',
                    points: '20',
                    choices: [
                        { text: 'Choice 1', isCorrect: true },
                        { text: 'Choice 2', isCorrect: false },
                    ],
                },
                {
                    type: 'QCM',
                    points: '10',
                    choices: [
                        { text: 'Option A', isCorrect: true },
                        { text: 'Option B', isCorrect: false },
                    ],
                },
            ],
        };

        service.postGame(mockGame).subscribe(() => {
            expect(mockGame.questions[0].choices).toBeUndefined();
            expect(mockGame.questions[1].choices).toBeDefined();
        });

        const req = httpMock.expectOne(`${service.baseURL}/createMatch`);
        expect(req.request.method).toBe('POST');
        req.flush({ success: true });
    });

    it('should delete choices for QRL questions when patching', () => {
        const date: Date = new Date();
        const mockGame = {
            id: 'matteo',
            duration: '10',
            lastModification: date.toISOString(),
            questions: [
                {
                    type: 'QRL',
                    points: '20',
                    choices: [
                        { text: 'Choice 1', isCorrect: true },
                        { text: 'Choice 2', isCorrect: false },
                    ],
                },
                {
                    type: 'QCM',
                    points: '10',
                    choices: [
                        { text: 'Option A', isCorrect: true },
                        { text: 'Option B', isCorrect: false },
                    ],
                },
            ],
        };

        service.patchGame(mockGame, mockGame.id).subscribe(() => {
            expect(mockGame.questions[0].choices).toBeUndefined();
            expect(mockGame.questions[1].choices).toBeDefined();
        });

        const req = httpMock.expectOne(`${service.baseURL}/createMatch/${mockGame.id}`);
        expect(req.request.method).toBe('PATCH');
        req.flush({ success: true });
    });
});
