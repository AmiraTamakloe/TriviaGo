import { Component, OnDestroy, OnInit } from '@angular/core';
import { HistogramInfoService } from '@app/services/histogram-info/histogram-info.service';
import { Histogram } from '@common/histogram';

@Component({
    selector: 'app-histogram-slider',
    templateUrl: './histogram-slider.component.html',
    styleUrls: ['./histogram-slider.component.scss'],
})
export class HistogramSliderComponent implements OnInit, OnDestroy {
    slides: Histogram[];
    questions: string[];
    currentIndex = 0;

    constructor(private histogramInfoService: HistogramInfoService) {}

    ngOnInit(): void {
        this.slides = this.histogramInfoService.histogramList;
        this.questions = this.histogramInfoService.questions;
    }

    ngOnDestroy(): void {
        this.histogramInfoService.reset();
    }

    previousSlide() {
        if (this.currentIndex === 0) {
            this.currentIndex = this.slides.length - 1;
        } else {
            this.currentIndex -= 1;
        }
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    }
}
