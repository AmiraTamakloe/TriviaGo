import { HistogramBar } from '@common/histogram-bar';

export interface Histogram {
    isQcm: boolean;
    bars: HistogramBar[];
}
