/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GameDetailsComponent } from '@app/components/game-details/game-details.component';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game/game.service';
import { PaginatorHandlerService } from '@app/services/paginator-handler/paginator-handler.service';
import { NUMBER_OF_GAMES_PER_PAGE } from '@common/constants';
import { of } from 'rxjs';
import { GameListComponent } from './game-list.component';

describe('GameListComponent', () => {
    let component: GameListComponent;
    let fixture: ComponentFixture<GameListComponent>;
    let paginatorHandlerSpy: jasmine.SpyObj<PaginatorHandlerService>;
    let gameService: GameService;
    let event: PageEvent;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    const games: Game[] = [
        {
            id: '1',
            $schema: 'this is schema 1',
            visible: true,
            title: 'Game 1',
            description: 'Description for Game 1',
            lastModification: 'day 1',
            duration: 60,
            questions: [
                {
                    type: 'QCM',
                    text: 'Question 1 for Game 1',
                    points: 2,
                    choices: [{ text: 'Choice 1', isCorrect: true }],
                },
            ],
        },
        {
            id: '2',
            $schema: 'this is schema 2',
            visible: true,
            title: 'Game 2',
            description: 'Description for Game 2',
            duration: 45,
            lastModification: 'day 2',
            questions: [
                {
                    type: 'QCM',
                    text: 'Question 1 for Game 2',
                    points: 2,
                    choices: [{ text: 'Choice 1', isCorrect: true }],
                },
            ],
        },
        {
            id: '3',
            $schema: 'this is schema 3',
            visible: true,
            title: 'Game 3',
            description: 'Description for Game 3',
            duration: 70,
            lastModification: 'day 3',
            questions: [
                {
                    type: 'QCM',
                    text: 'Question 1 for Game 3',
                    points: 2,
                    choices: [{ text: 'Choice 1', isCorrect: true }],
                },
            ],
        },
        {
            id: '4',
            $schema: 'this is schema 4',
            visible: true,
            title: 'Game 4',
            description: 'Description for Game 4',
            duration: 55,
            lastModification: 'day 4',
            questions: [
                {
                    type: 'QCM',
                    text: 'Question 1 for Game 4',
                    points: 2,
                    choices: [{ text: 'Choice 1', isCorrect: true }],
                },
            ],
        },
        {
            id: '5',
            $schema: 'this is schema 5',
            visible: true,
            title: 'Game 5',
            description: 'Description for Game 5',
            duration: 50,
            lastModification: 'day 5',
            questions: [
                {
                    type: 'QCM',
                    text: 'Question 1 for Game 5',
                    points: 2,
                    choices: [{ text: 'Choice 1', isCorrect: true }],
                },
            ],
        },
        {
            id: '6',
            $schema: 'this is schema 6',
            visible: true,
            title: 'Game 6',
            description: 'Description for Game 6',
            duration: 65,
            lastModification: 'day 6',
            questions: [
                {
                    type: 'QCM',
                    text: 'Question 1 for Game 6',
                    points: 2,
                    choices: [{ text: 'Choice 1', isCorrect: true }],
                },
            ],
        },
        {
            id: '7',
            $schema: 'this is schema 7',
            visible: true,
            title: 'Game 7',
            description: 'Description for Game 7',
            duration: 75,
            lastModification: 'day 7',
            questions: [
                {
                    type: 'QCM',
                    text: 'Question 1 for Game 7',
                    points: 2,
                    choices: [{ text: 'Choice 1', isCorrect: true }],
                },
            ],
        },
        {
            id: '8',
            $schema: 'this is schema 8',
            visible: true,
            title: 'Game 8',
            description: 'Description for Game 8',
            duration: 40,
            lastModification: 'day 8',
            questions: [
                {
                    type: 'QCM',
                    text: 'Question 1 for Game 8',
                    points: 2,
                    choices: [{ text: 'Choice 1', isCorrect: true }],
                },
            ],
        },
        {
            id: '9',
            $schema: 'this is schema 9',
            visible: true,
            title: 'Game 9',
            description: 'Description for Game 9',
            duration: 55,
            lastModification: 'day 9',
            questions: [
                {
                    type: 'QCM',
                    text: 'Question 1 for Game 9',
                    points: 2,
                    choices: [{ text: 'Choice 1', isCorrect: true }],
                },
            ],
        },
    ];

    beforeEach(async () => {
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        paginatorHandlerSpy = jasmine.createSpyObj('PaginatorHandler', ['handlePageChange']);
        TestBed.configureTestingModule({
            declarations: [GameListComponent, GameDetailsComponent, MatPaginator],
            imports: [MatIconModule, MatDialogModule, HttpClientTestingModule, MatTooltipModule],
            providers: [
                { provide: MatDialog, useValue: dialogSpy },
                GameService,
                { provide: PaginatorHandlerService, useValue: paginatorHandlerSpy },
            ],
        });
        fixture = TestBed.createComponent(GameListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        event = new PageEvent();
        gameService = TestBed.inject(GameService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize numGamesOnPage correctly', () => {
        expect(component['numGamesOnPage']).toEqual(NUMBER_OF_GAMES_PER_PAGE);
    });

    it('should correctly slice the array containing the games when ngOnInit() is called', async () => {
        spyOn(component as any, 'fetchGamesFromDB').and.returnValue(Promise.resolve(games));
        await component.ngOnInit();
        const result = games.slice(0, component['numGamesOnPage']);
        expect(component['gamesOnPage']).toEqual(result);
    });

    it('should call the paginator method handlePageChange when handlePageChange is called', () => {
        const fakeFunction = <T>(): T[] => {
            return [{ fakeText: 'hi' }] as T[];
        };
        paginatorHandlerSpy.handlePageChange.and.callFake(fakeFunction);
        component.handlePageChange(event);
        expect(paginatorHandlerSpy.handlePageChange).toHaveBeenCalled();
    });

    it('should call subscribe() and the service fetchVisibleGames when fetchGamesFromDB() is called', fakeAsync(() => {
        const spy = spyOn(gameService, 'fetchVisibleGames').and.returnValue(of(games));
        const subscribeSpy = spyOn(gameService.fetchVisibleGames(), 'subscribe');

        component['fetchGamesFromDB']();

        tick();

        expect(spy).toHaveBeenCalledBefore(subscribeSpy);
        expect(subscribeSpy).toHaveBeenCalled();
    }));

    it('should open a dialog with the correct message when displayPopup is called', () => {
        component['displayPopup']();

        const expectedDialogConfig = jasmine.objectContaining({ autoFocus: true });
        expect(dialogSpy.open).toHaveBeenCalledWith(jasmine.any(Function), {
            data: { message: 'Le jeu est malheureusement indisponible. Veuillez en sélectionner un autre.', dialogConfig: expectedDialogConfig },
            panelClass: 'scrollable-dialog',
        });
    });

    it('should update games and gamesOnPage when handleViewUpdate() is called', async () => {
        const newGames: Game[] = [
            {
                id: '1',
                $schema: 'this is schema 1',
                visible: true,
                title: 'New Game 1',
                description: 'Description for Game 1',
                duration: 60,
                lastModification: 'day 1',
                questions: [
                    {
                        type: 'QCM',
                        text: 'Question 1 for Game 1',
                        points: 2,
                        choices: [{ text: 'Choice 1', isCorrect: true }],
                    },
                ],
            },
            {
                id: '2',
                $schema: 'this is schema 2',
                visible: true,
                title: 'New Game 2',
                description: 'Description for Game 2',
                duration: 45,
                lastModification: 'day 2',
                questions: [
                    {
                        type: 'QCM',
                        text: 'Question 1 for Game 2',
                        points: 2,
                        choices: [{ text: 'Choice 1', isCorrect: true }],
                    },
                ],
            },
        ];
        spyOn(component as any, 'fetchGamesFromDB').and.returnValue(Promise.resolve(newGames));

        await component.handleViewUpdate();

        expect(component['games']).toEqual(newGames);
        expect(component['gamesOnPage']).toEqual(newGames.slice(0, component['numGamesOnPage']));
    });

    it('should delete a game and update properties', () => {
        component['games'] = games;
        component['totalVisibleGames'] = component['games'].length;
        component['numGamesOnPage'] = 8;
        component.handleDelete(1);
        expect(component['games']).toEqual(games);
        expect(component['totalVisibleGames']).toBe(8);
        expect(component['gamesOnPage']).toEqual(games);
    });
});
