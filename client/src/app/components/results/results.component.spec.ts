import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { MatchManagementService } from '@app/services/match-management/match-management.service';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';
import { Result } from '@common/results';
import { of } from 'rxjs';
import { ResultsComponent } from './results.component';
import SpyObj = jasmine.SpyObj;
import { HistogramSliderComponent } from '@app/components/histogram-slider/histogram-slider.component';
import { StaticHistogramComponent } from '@app/components/static-histogram/static-histogram.component';

describe('ResultsComponent', () => {
    let component: ResultsComponent;
    let fixture: ComponentFixture<ResultsComponent>;
    let matchManagementServiceSpy: SpyObj<MatchManagementService>;
    let matchQuestionManagementServiceSpy: SpyObj<MatchQuestionManagementService>;
    let gameHistoryServiceSpy: SpyObj<GameHistoryService>;

    beforeEach(() => {
        matchManagementServiceSpy = jasmine.createSpyObj('MatchManagementService', ['finalResult', 'matchOver', 'finalResults']);
        gameHistoryServiceSpy = jasmine.createSpyObj('GameService', ['postGameHistory']);
        matchQuestionManagementServiceSpy = jasmine.createSpyObj('MatchQuestionManagementService', ['matchOver']);
        TestBed.configureTestingModule({
            declarations: [ResultsComponent, HistogramSliderComponent, StaticHistogramComponent],
            imports: [MatSnackBarModule],
            providers: [
                { provide: GameHistoryService, useValue: gameHistoryServiceSpy },
                { provide: MatchQuestionManagementService, useValue: matchManagementServiceSpy },
                { provide: MatchQuestionManagementService, useValue: matchQuestionManagementServiceSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        queryParams: of({ organizer: 'true' }),
                        snapshot: {
                            params: { id: '1234' },
                        },
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ResultsComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should set finalResults and call finalResult method on ngOnInit', async () => {
        const test: Result[] = [{ name: 'allo', points: 14, bonus: 14 }];
        matchManagementServiceSpy.finalResults = test;
        await component.ngOnInit();
        component.finalResults = test;
        expect(component.finalResults).toEqual(matchManagementServiceSpy.finalResults);
    });

    it('should call matchQuestionManagementService.matchOver on quitMatch()', () => {
        component.quitMatch();
        expect(matchQuestionManagementServiceSpy.matchOver).toHaveBeenCalled();
    });

    it('should sort the list of results by descending order of points and alphabtically if the points are equal', () => {
        const fakeResults: Result[] = [
            { name: 'b', points: 0, bonus: 0 },
            { name: 'a', points: 0, bonus: 0 },
            { name: 'c', points: 12, bonus: 1 },
            { name: 'd', points: 10, bonus: 0 },
        ];
        component.finalResults = fakeResults;
        component.sortResult();

        expect(component.sortedResults).toEqual([
            { name: 'c', points: 12, bonus: 1 },
            { name: 'd', points: 10, bonus: 0 },
            { name: 'a', points: 0, bonus: 0 },
            { name: 'b', points: 0, bonus: 0 },
        ]);
    });
});
