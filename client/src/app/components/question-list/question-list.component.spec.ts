import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { GameInterface } from '@app/interfaces/game-interface';
import { PaginatorHandlerService } from '@app/services/paginator-handler/paginator-handler.service';
import { QuestionListComponent } from './question-list.component';
import SpyObj = jasmine.SpyObj;

describe('QuestionListComponent', () => {
    let component: QuestionListComponent;
    let fixture: ComponentFixture<QuestionListComponent>;
    let paginatorHandler: PaginatorHandlerService;
    let event: PageEvent;
    const questionList: GameInterface['questions'] = [
        {
            type: 'QCM',
            text: '2 + 2 = ?',
            points: 2,
            choices: [{ text: '4', isCorrect: true }],
        },
    ];
    let mockActivatedRoute: SpyObj<ActivatedRoute>;
    const data = { questions: questionList };

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [QuestionListComponent, MatPaginator],
            imports: [MatTooltipModule],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { questions: ['Question 1', 'Question 2'] },
                },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
            ],
        });
        fixture = TestBed.createComponent(QuestionListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        paginatorHandler = new PaginatorHandlerService();
        event = new PageEvent();
        component['numQuestionsOnPage'] = 1;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should correctly slice the array containing the questions when ngOnInit is called', async () => {
        for (let i = 0; i < component['numQuestionsOnPage']; i++) {
            questionList.push({
                type: 'QCM',
                text: '2 + 3 = ?',
                points: 4,
                choices: [{ text: '5', isCorrect: true }],
            });
        }
        component.data.questions = questionList;
        component.ngOnInit();
        const result = questionList.slice(0, component['numQuestionsOnPage']);
        expect(component['questionsOnPage']).toEqual(result);
    });

    it('should initialize numQuestions to the correct number when ngOnInit is called', () => {
        expect(component['numQuestions']).toBeTruthy();
        expect(component['numQuestions']).toEqual(2);
    });

    it('should call the paginator method handlePageChangeQuestions when handlePageChange is called', () => {
        const spy = spyOn(paginatorHandler, 'handlePageChange').and.callThrough();
        component = new QuestionListComponent(data, paginatorHandler);
        component.handlePageChange(event);

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event, component.data.questions);
    });
});
