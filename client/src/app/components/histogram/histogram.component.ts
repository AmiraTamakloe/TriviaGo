import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game/game.service';
import { HistogramInfoService } from '@app/services/histogram-info/histogram-info.service';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';
import { PlayersListManagementService } from '@app/services/players-list-management/players-list-management.service';
import { BARCHART_MAX_HEIGHT_QCM } from '@common/constants';
import { HistogramBar } from '@common/histogram-bar';

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent implements OnInit, OnChanges, OnDestroy {
    @Input() questionNumber: number;
    @Input() list: HistogramBar[];
    protected isQcm: boolean;
    protected colorsArray: string[] = ['#498B94', '#F8C622', '#747474', '#EC972D'];
    private game: Game;
    private total = 3;
    private playersChoice: { name: string; choices: number[] }[] = [];
    private qrlLegend = ['0', '0.5', '1'];

    // eslint-disable-next-line max-params
    constructor(
        private route: ActivatedRoute,
        private gameService: GameService,
        private playersListManagementService: PlayersListManagementService,
        private matchQuestionManagementService: MatchQuestionManagementService,
        private histogramInfoService: HistogramInfoService,
    ) {}

    get listValues(): HistogramBar[] {
        return this.list;
    }
    get gameValue(): Game {
        return this.game;
    }
    get totalValue() {
        return this.total;
    }

    set totalValue(total: number) {
        this.total = total;
    }
    set listValues(list: HistogramBar[]) {
        this.list = list;
    }

    set gameValue(game: Game) {
        this.game = game;
    }

    ngOnInit(): void {
        const id = this.route.snapshot.params.id;
        this.gameService.fetchGameById(id).subscribe((res) => {
            this.game = res as Game;
            this.createChart();
        });
        this.totalValue = this.playersListManagementService.playersList.length;
        this.playersListManagementService.playersList.forEach((player) => {
            this.playersChoice.push({ name: player, choices: [] });
        });

        this.matchQuestionManagementService.updateChart.subscribe((value) => {
            this.updateChart(value);
        });
    }

    ngOnDestroy(): void {
        this.playersListManagementService.endGame();
        this.matchQuestionManagementService.endGame();
    }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        if (changes.questionNumber.currentValue) {
            if (this.isQcm) {
                await this.histogramInfoService.addBars(this.list, this.isQcm);
            }
            await this.createChart();
            this.playersChoice.forEach((element) => {
                element.choices = [];
            });
        }
    }

    updateChart(res: { player: string; answer: number[] }) {
        this.playersChoice.forEach((element) => {
            if (element.name === res.player) {
                element.choices = res.answer;
            }
        });
        this.list.forEach((element) => {
            element.value = 0;
        });
        this.playersChoice.forEach((element) => {
            element.choices.forEach((choice) => {
                this.list[choice].value += 1;
            });
        });
        this.list.forEach((element) => {
            element.size = Math.round((element.value * BARCHART_MAX_HEIGHT_QCM) / this.total) + 'px';
        });
        this.histogramInfoService.barsForLastQuestion = this.list;
    }

    async createChart() {
        this.histogramInfoService.questions = [];

        for (const question of this.game.questions) {
            this.histogramInfoService.questions.push(question.text);
        }

        const barVal: HistogramBar[] = [];
        this.isQcm = this.matchQuestionManagementService.isQcm();
        if (this.isQcm) {
            const choices = this.game.questions[this.questionNumber].choices;
            for (let i = 0; i < choices.length; i++) {
                barVal[i] = { value: 0, color: this.colorsArray[i], size: '0px', legend: choices[i].text };
            }
            this.list = barVal;
        } else {
            for (let i = 0; i < this.qrlLegend.length; i++) {
                barVal[i] = { value: 0, color: this.colorsArray[i], size: '0px', legend: this.qrlLegend[i] };
            }
            this.histogramInfoService.addBars(barVal, this.isQcm);
        }
    }
}
