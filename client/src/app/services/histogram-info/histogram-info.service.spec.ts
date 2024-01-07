/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Histogram } from '@common/histogram';
import { HistogramBar } from '@common/histogram-bar';
import { Socket } from 'socket.io-client';
import { HistogramInfoService } from './histogram-info.service';

class SocketClientServiceMock extends SocketClientService {
    override connect() {}
    override removeAllListeners(event?: string) {}
}

describe('HistogramInfoService', () => {
    let service: HistogramInfoService;
    let socketClientServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    const fakeHistograms: Histogram[] = [
        { isQcm: true, bars: [{ value: 1, color: '', size: '', legend: '' }] },
        { isQcm: true, bars: [{ value: 2, color: '', size: '', legend: '' }] },
    ];
    const fakeQuestions: string[] = ['Q1', 'Q2'];
    const data = { histograms: fakeHistograms, questions: fakeQuestions };
    const half = 0.5;
    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        socketClientServiceMock = new SocketClientServiceMock();
        socketClientServiceMock.socket = socketHelper as unknown as Socket;
        TestBed.configureTestingModule({
            providers: [{ provide: SocketClientService, useValue: socketClientServiceMock }],
        });
        service = TestBed.inject(HistogramInfoService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return the correct list of histograms', () => {
        service['histograms'] = fakeHistograms;
        expect(service.histogramList).toEqual(fakeHistograms);
    });

    it('should update histograms when socket event received', () => {
        service.init();
        socketHelper.peerSideEmit('histogramsForResult', data);
        expect(service.histogramList).toEqual(fakeHistograms);
    });

    it('should empty the histograms and call removeAllListeners when reset is called', () => {
        const spy = spyOn(service['socketClientService'], 'removeAllListeners');
        service.reset();
        expect(service.histogramList.length).toEqual(0);
        expect(spy).toHaveBeenCalled();
    });

    it('should add bars to the histograms array', () => {
        const initialQuestionNumber = 1;
        const newBars: HistogramBar[] = [{ value: 5, color: '#123456', size: '50%', legend: 'New Bar' }];
        service.addBars(newBars, true);
        expect(service.histogramList.length).toEqual(initialQuestionNumber);
        expect(service.histogramList[initialQuestionNumber - 1].bars).toEqual(newBars);
    });

    it('should add last bars if isQcm is true', () => {
        const initialQuestionNumber = 1;
        const newBars: HistogramBar[] = [{ value: 5, color: '#123456', size: '50%', legend: 'New Bar' }];
        service.barsForLastQuestion = newBars;
        service.addBarsForLastQuestion(true);
        expect(service.histogramList.length).toEqual(initialQuestionNumber);
        expect(service.histogramList[initialQuestionNumber - 1].bars).toEqual(newBars);
    });

    it('updateQrlValue should increment the value of the bar properly', () => {
        const qrlBars: HistogramBar[] = [
            { value: 0, color: '', size: '0px', legend: '0' },
            { value: 0, color: '', size: '0px', legend: '0.5' },
            { value: 0, color: '', size: '0px', legend: '1' },
        ];
        service['histograms'] = [{ isQcm: false, bars: qrlBars }];
        service.index = 1;
        service.updateQrlValue(0);
        expect(service['histograms'][0].bars[0].value).toEqual(1);
    });

    it('updateQrlValue should increment the value of the bar properly', () => {
        const qrlBars: HistogramBar[] = [
            { value: 0, color: '', size: '0px', legend: '0' },
            { value: 0, color: '', size: '0px', legend: '0.5' },
            { value: 0, color: '', size: '0px', legend: '1' },
        ];
        service['histograms'] = [{ isQcm: false, bars: qrlBars }];
        service.index = 1;
        service.updateQrlValue(half);
        expect(service['histograms'][0].bars[1].value).toEqual(1);
    });

    it('updateQrlValue should increment the value of the bar properly', () => {
        const qrlBars: HistogramBar[] = [
            { value: 0, color: '', size: '0px', legend: '0' },
            { value: 0, color: '', size: '0px', legend: '0.5' },
            { value: 0, color: '', size: '0px', legend: '1' },
        ];
        service['histograms'] = [{ isQcm: false, bars: qrlBars }];
        service.index = 1;
        service.updateQrlValue(1);
        expect(service['histograms'][0].bars[2].value).toEqual(1);
    });
});
