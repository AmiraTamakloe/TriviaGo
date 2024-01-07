import { Component, Input } from '@angular/core';
import { HistogramBar } from '@common/histogram-bar';

@Component({
    selector: 'app-static-histogram',
    templateUrl: './static-histogram.component.html',
    styleUrls: ['./static-histogram.component.scss'],
})
export class StaticHistogramComponent {
    @Input() list: HistogramBar[];
}
