import { Component, OnInit } from '@angular/core';
import { MatchManagementService } from '@app/services/match-management/match-management.service';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';
import { Result } from '@common/results';

export enum SortingDirection {
    BEFORE = -1,
    AFTER = 1,
}

@Component({
    selector: 'app-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.scss'],
})
export class ResultsComponent implements OnInit {
    finalResults: Result[];
    sortedResults: Result[];

    constructor(
        private matchManagementService: MatchManagementService,
        private matchQuestionManagementService: MatchQuestionManagementService,
    ) {}
    async ngOnInit(): Promise<void> {
        this.finalResults = this.matchManagementService.finalResults;
        this.sortResult();
    }

    quitMatch() {
        this.matchQuestionManagementService.matchOver();
    }

    sortResult() {
        this.sortedResults = this.finalResults.sort((p1, p2) => {
            if (p1.points > p2.points) {
                return SortingDirection.BEFORE;
            } else if (p1.points < p2.points) {
                return SortingDirection.AFTER;
            } else {
                return p1.name.localeCompare(p2.name);
            }
        });
    }
}
