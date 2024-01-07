import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { GameInterface } from '@app/interfaces/game-interface';
import { PaginatorHandlerService } from '@app/services/paginator-handler/paginator-handler.service';
import { NUMBER_OF_QUESTIONS_PER_PAGE } from '@common/constants';
@Component({
    selector: 'app-question-list',
    templateUrl: './question-list.component.html',
    styleUrls: ['./question-list.component.scss'],
})
export class QuestionListComponent implements OnInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @Input() isAdmin: boolean;
    protected questionsOnPage: GameInterface['questions'];
    protected numQuestionsOnPage: number = NUMBER_OF_QUESTIONS_PER_PAGE;
    protected numQuestions: number;
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { questions: GameInterface['questions'] },
        private paginatorHandler: PaginatorHandlerService,
    ) {}

    ngOnInit(): void {
        this.questionsOnPage = this.data.questions.slice(0, this.numQuestionsOnPage) as GameInterface['questions'];
        this.numQuestions = this.data.questions.length;
    }

    handlePageChange(event: PageEvent): void {
        this.questionsOnPage = this.paginatorHandler.handlePageChange(event, this.data.questions) as GameInterface['questions'];
    }
}
