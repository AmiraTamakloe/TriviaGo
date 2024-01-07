import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { BARCHART_MAX_HEIGHT_QRL, NB_OF_QRL_BARS } from '@common/constants';
import { Histogram } from '@common/histogram';
import { HistogramBar } from '@common/histogram-bar';

@Injectable({
    providedIn: 'root',
})
export class HistogramInfoService {
    index: number = 0;
    barsForLastQuestion: HistogramBar[];
    questions: string[] = [];
    private histograms: Histogram[] = [];

    constructor(private socketClientService: SocketClientService) {}

    get histogramList(): Histogram[] {
        return this.histograms;
    }

    init(): void {
        this.socketClientService.on('histogramsForResult', (data: { histograms: Histogram[]; questions: string[] }) => {
            this.histograms = data.histograms;
            this.questions = data.questions;
        });
    }

    addBars(newBars: HistogramBar[], isQcm: boolean) {
        const newHistogram: Histogram = { isQcm, bars: [] };
        this.histograms.push(newHistogram);
        this.histograms[this.index].bars = newBars;
        this.index++;
    }

    addBarsForLastQuestion(isQcm: boolean) {
        if (isQcm) {
            this.addBars(this.barsForLastQuestion, isQcm);
        }
        this.socketClientService.send('histogramsSent', { histograms: this.histograms, questions: this.questions });
    }

    reset() {
        this.histograms.length = 0;
        this.index = 0;
        this.socketClientService.removeAllListeners('histogramsForResult');
    }

    updateQrlValue(note: number) {
        if (note === 0) {
            this.histograms[this.index - 1].bars[0].value++;
            this.updateQrlSize(this.histograms[this.index - 1].bars[0]);
        } else if (note === 1) {
            this.histograms[this.index - 1].bars[2].value++;
            this.updateQrlSize(this.histograms[this.index - 1].bars[2]);
        } else {
            this.histograms[this.index - 1].bars[1].value++;
            this.updateQrlSize(this.histograms[this.index - 1].bars[1]);
        }
    }

    private updateQrlSize(bar: HistogramBar) {
        bar.size = Math.round((bar.value * BARCHART_MAX_HEIGHT_QRL) / NB_OF_QRL_BARS) + 'px';
    }
}
