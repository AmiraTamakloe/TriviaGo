import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { QuestionDescriptionComponent } from '@app/components/question-description/question-description.component';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game/game.service';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';
import { TimeService } from '@app/services/time/time.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

const ID = 'dkfsdfsdf';
const pts = 10;
const game: Game = {
    id: ID,
    visible: false,
    title: 'Test Game',
    duration: 60,
    questions: [
        {
            type: 'multiple-choice',
            text: 'What is the capital of France?',
            choices: [
                {
                    text: 'Paris',
                    isCorrect: true,
                },
                {
                    text: 'Mtl',
                    isCorrect: false,
                },
            ],
            points: pts,
        },
    ],
    $schema: '',
    description: '',
    lastModification: '',
};

describe('QuestionDescriptionComponent', () => {
    let component: QuestionDescriptionComponent;
    let fixture: ComponentFixture<QuestionDescriptionComponent>;
    let timeServiceSpy: SpyObj<TimeService>;
    let gameServiceSpy: SpyObj<GameService>;
    let matchQuestionManagementServiceSpy: MatchQuestionManagementService;

    beforeEach(() => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer', 'time']);
        gameServiceSpy = jasmine.createSpyObj('GameService', ['gameInformation', 'gameById', 'fetchGameById']);
        TestBed.configureTestingModule({
            declarations: [QuestionDescriptionComponent],
            providers: [
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            params: { id: ID },
                        },
                    },
                },
            ],
            imports: [MatIconModule, MatSnackBarModule],
        });
        gameServiceSpy.fetchGameById.and.returnValue(of(game));

        fixture = TestBed.createComponent(QuestionDescriptionComponent);
        component = fixture.componentInstance;
        matchQuestionManagementServiceSpy = TestBed.inject(MatchQuestionManagementService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update properties and emit values', () => {
        component.questionNumber = 0;
        const info: Game = {
            id: 'dkfsdfsdf',
            visible: false,
            title: 'Game Title',
            description: 'maman',
            duration: 4,
            questions: [
                {
                    type: 'ok',
                    text: 'Question 1',
                    points: 2,
                    choices: [{ text: 'ok', isCorrect: true }],
                },
            ],
            $schema: '',
            lastModification: '',
        };
        component['game'] = info;
        const pointSpy = spyOn(component.point, 'emit');

        component['nextQuestion']();
        expect(component.questionTitle).toBe('Game Title');
        expect(component.questionDescription).toBe('Question 1');
        expect(component.questionPoints).toBe(2);
        expect(pointSpy).toHaveBeenCalledWith(2);
    });

    it('should initialize properly', async () => {
        component.questionNumber = 0;

        component.ngOnInit();
        expect(component.questionPoints).toEqual(game.questions[component.questionNumber].points);
        expect(component.questionTitle).toEqual(game.title);
        expect(component.questionDescription).toEqual(game.questions[component.questionNumber].text);
    });

    it('should initialize properly', async () => {
        component.questionNumber = 0;
        matchQuestionManagementServiceSpy.nextQuestion.next(true);
        component.ngOnInit();
        expect(component.questionPoints).toEqual(game.questions[component.questionNumber].points);
    });
});
