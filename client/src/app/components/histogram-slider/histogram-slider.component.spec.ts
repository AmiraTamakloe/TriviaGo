import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StaticHistogramComponent } from '@app/components/static-histogram/static-histogram.component';
import { HistogramInfoService } from '@app/services/histogram-info/histogram-info.service';
import { Histogram } from '@common/histogram';
import { HistogramSliderComponent } from './histogram-slider.component';

describe('HistogramSliderComponent', () => {
    let component: HistogramSliderComponent;
    let fixture: ComponentFixture<HistogramSliderComponent>;
    let histogramInfoServiceSpy: jasmine.SpyObj<HistogramInfoService>;
    const fakeSlides: Histogram[] = [
        { isQcm: true, bars: [{ value: 1, color: '', size: '', legend: '' }] },
        { isQcm: true, bars: [{ value: 1, color: '', size: '', legend: '' }] },
    ];

    const fakeQuestions: string[] = ['Q1', 'Q2'];

    beforeEach(() => {
        histogramInfoServiceSpy = jasmine.createSpyObj('HistogramInfoService', ['addBars', 'reset']);
        Object.defineProperty(histogramInfoServiceSpy, 'histogramList', {
            get: () => fakeSlides,
            configurable: true,
        });
        Object.defineProperty(histogramInfoServiceSpy, 'questions', {
            get: jasmine.createSpy().and.returnValue(fakeQuestions),
        });
        TestBed.configureTestingModule({
            declarations: [HistogramSliderComponent, StaticHistogramComponent],
            providers: [{ provide: HistogramInfoService, useValue: histogramInfoServiceSpy }],
        });
        fixture = TestBed.createComponent(HistogramSliderComponent);
        component = fixture.componentInstance;
        component.questions = fakeQuestions;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set slides from histogramInfoService', () => {
        fixture.detectChanges();
        expect(component.slides).toEqual(fakeSlides);
    });

    it('should increment currentIndex properly when nextSlide is called', () => {
        component.currentIndex = 1;
        component.nextSlide();
        expect(component.currentIndex).toEqual(0);
    });
    it('should decrement currentIndex properly when previousSlide is called', () => {
        component.previousSlide();
        expect(component.currentIndex).toEqual(1);

        component.currentIndex = 1;
        component.previousSlide();
        expect(component.currentIndex).toEqual(0);
    });
});
