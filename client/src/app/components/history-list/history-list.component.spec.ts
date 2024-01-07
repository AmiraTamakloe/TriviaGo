/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GameDetailsComponent } from '@app/components/game-details/game-details.component';
import { History } from '@app/interfaces/history';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { PaginatorHandlerService } from '@app/services/paginator-handler/paginator-handler.service';
import { NUMBER_OF_GAMES_PER_PAGE } from '@common/constants';
import { of } from 'rxjs';
import { HistoryListComponent } from './history-list.component';

describe('HistoryListComponent', () => {
    let component: HistoryListComponent;
    let fixture: ComponentFixture<HistoryListComponent>;
    let paginatorHandlerSpy: jasmine.SpyObj<PaginatorHandlerService>;
    let gameHistoryService: GameHistoryService;
    let event: PageEvent;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    const history: History[] = [
        {
            gameName: 'Cedrick test',
            date: '11/9/2023',
            playersNumber: 2,
            bestScore: 60,
        },
    ];

    beforeEach(async () => {
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        paginatorHandlerSpy = jasmine.createSpyObj('PaginatorHandler', ['handlePageChange']);
        TestBed.configureTestingModule({
            declarations: [HistoryListComponent, GameDetailsComponent, MatPaginator],
            imports: [MatIconModule, MatDialogModule, HttpClientTestingModule, MatTooltipModule],
            providers: [
                { provide: MatDialog, useValue: dialogSpy },
                GameHistoryService,
                { provide: PaginatorHandlerService, useValue: paginatorHandlerSpy },
            ],
        });
        fixture = TestBed.createComponent(HistoryListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        event = new PageEvent();
        gameHistoryService = TestBed.inject(GameHistoryService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize numGamesHistoryOnPage correctly', () => {
        expect(component['numGamesHistoryOnPage']).toEqual(NUMBER_OF_GAMES_PER_PAGE);
    });

    it('should correctly slice the array containing the games when ngOnInit() is called', async () => {
        spyOn(gameHistoryService, 'fetchGameHistory').and.returnValue(of(history));
        await component.ngOnInit();
        const result = history.slice(0, component['numGamesHistoryOnPage']);
        expect(component['gamesHistoryOnPage']).toEqual(result);
    });

    it('should call the paginator method handlePageChange when handlePageChange is called', () => {
        const fakeFunction = <T>(): T[] => {
            return [{ fakeText: 'hi' }] as T[];
        };
        paginatorHandlerSpy.handlePageChange.and.callFake(fakeFunction);
        component.handlePageChange(event);
        expect(paginatorHandlerSpy.handlePageChange).toHaveBeenCalled();
    });

    it('should sort game history by name in ascending order', () => {
        component['history'] = [
            { gameName: 'Game B', date: '11/20/2024', playersNumber: 2, bestScore: 40 },
            { gameName: 'Game A', date: '12/20/2024', playersNumber: 2, bestScore: 40 },
            { gameName: 'Game C', date: '13/20/2024', playersNumber: 2, bestScore: 40 },
        ];
        component['isAscending'] = { gameName: true, date: true };
        component.gameHistoryOrder('gameName');
        expect(component['history'][0].gameName).toEqual('Game A');
        expect(component['history'][1].gameName).toEqual('Game B');
        expect(component['history'][2].gameName).toEqual('Game C');
    });

    it('should sort game history by date in descending order', () => {
        component['history'] = [
            { gameName: 'Game B', date: '11/20/2024', playersNumber: 2, bestScore: 40 },
            { gameName: 'Game A', date: '12/20/2024', playersNumber: 2, bestScore: 40 },
            { gameName: 'Game C', date: '13/20/2024', playersNumber: 2, bestScore: 40 },
        ];
        component['isAscending'] = { gameName: true, date: false };
        component.gameHistoryOrder('date');
        expect(component['history'][0].date).toEqual('13/20/2024');
        expect(component['history'][1].date).toEqual('12/20/2024');
        expect(component['history'][2].date).toEqual('11/20/2024');
    });

    it('should delete game history and clear gamesHistoryOnPage and historyLength', () => {
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true) });
        (dialogSpy.open as jasmine.Spy).and.returnValue(dialogRefSpyObj);
        component.deleteHistory();
        expect(component['gamesHistoryOnPage']).toEqual([]);
        expect(component['historyLength']).toEqual(0);
    });
});
