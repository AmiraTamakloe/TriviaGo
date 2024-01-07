import { Component, Input, OnInit } from '@angular/core';
import { QrlHostService } from '@app/services/qrl-host/qrl-host.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { BARCHART_MAX_HEIGHT_QRL } from '@common/constants';
import { HistogramBar } from '@common/histogram-bar';
@Component({
    selector: 'app-qrl-host-histogram',
    templateUrl: './qrl-host-histogram.component.html',
    styleUrls: ['./qrl-host-histogram.component.scss'],
})
export class QrlHostHistogramComponent implements OnInit {
    @Input() questionNumber: number;
    @Input() list: HistogramBar[];
    protected colorsArray: string[] = ['#9530CE', '#8AE0C5'];
    constructor(
        readonly qrlHostService: QrlHostService,
        private socket: SocketClientService,
    ) {}
    ngOnInit() {
        this.socket.send('newQrl');
    }

    setSize(size: number, total: number) {
        return Math.round((size * BARCHART_MAX_HEIGHT_QRL) / total) + '%';
    }
}
