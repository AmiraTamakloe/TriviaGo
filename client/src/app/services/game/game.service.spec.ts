import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Game } from '@app/interfaces/game';
import { environment } from 'src/environments/environment';
import { GameService } from './game.service';

describe('GameService', () => {
    let service: GameService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [GameService],
        });

        service = TestBed.inject(GameService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch all games', () => {
        const dummyGames: Game[] = [
            {
                id: '1',
                $schema: 'schema 1',
                title: 'Game 1',
                description: 'description 1',
                visible: true,
                duration: 60,
                lastModification: 'yesterday',
                questions: [],
            },
            {
                id: '2',
                $schema: 'schema 2',
                title: 'Game 2',
                description: 'description 2',
                visible: false,
                duration: 120,
                lastModification: 'today',
                questions: [],
            },
        ];

        service.fetchAllGames().subscribe((games) => {
            expect(games).toEqual(dummyGames);
        });

        const req = httpTestingController.expectOne(environment.serverUrl + '/game');
        expect(req.request.method).toBe('GET');
        req.flush(dummyGames);
    });

    it('should fetch visible games', () => {
        const dummyVisibleGames: Game[] = [
            {
                id: '1',
                $schema: 'schema 1',
                title: 'Game 1',
                description: 'description 1',
                visible: true,
                duration: 60,
                lastModification: 'yesterday',
                questions: [],
            },
            {
                id: '2',
                $schema: 'schema 2',
                title: 'Game 2',
                description: 'description 2',
                visible: true,
                duration: 120,
                lastModification: 'today',
                questions: [],
            },
        ];

        service.fetchVisibleGames().subscribe((games) => {
            expect(games).toEqual(dummyVisibleGames);
        });

        const req = httpTestingController.expectOne(environment.serverUrl + '/game?isGameVisible=true');
        expect(req.request.method).toBe('GET');
        req.flush(dummyVisibleGames);
    });

    it('should fetch a game by id', () => {
        const gameId = '5f8792b55d9d972ac8348e52';
        const dummyGame: Game = {
            id: gameId,
            $schema: 'Test schema',
            title: 'Test Game',
            description: 'Test Description',
            visible: true,
            duration: 60,
            lastModification: 'Test Modification',
            questions: [],
        };

        service.fetchGameById(gameId).subscribe((game) => {
            expect(game).toEqual(dummyGame);
        });

        const req = httpTestingController.expectOne(environment.serverUrl + `/game/${gameId}`);
        expect(req.request.method).toBe('GET');
        req.flush(dummyGame);
    });

    it('should return an error if game by id not found', () => {
        const inexistentID = 'Amz';
        service.fetchGameById(inexistentID).subscribe({
            next: (response: Game) => {
                expect(response).toBeUndefined();
            },
            error: fail,
        });

        const req = httpTestingController.expectOne(environment.serverUrl + `/game/${inexistentID}`);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('Error'));
    });

    it('should toggle game visibility', () => {
        const gameId = '5f8792b55d9d972ac8348e52';
        service.patchGameVisibility(gameId).subscribe((response) => {
            expect(response).toBeDefined();
        });
        const req = httpTestingController.expectOne(environment.serverUrl + `/createMatch/${gameId}/toggleVisibility`);
        expect(req.request.method).toBe('PATCH');
        req.flush({});
    });

    it('should send a DELETE request to the correct URL', () => {
        const testId = '123';
        const expectedUrl = `${service['baseURL']}/createMatch/${testId}`;

        service.removeGame(testId);

        const req = httpTestingController.expectOne(expectedUrl);
        expect(req.request.method).toBe('DELETE');
    });
});
