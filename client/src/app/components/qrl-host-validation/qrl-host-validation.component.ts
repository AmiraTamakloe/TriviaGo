import { Component } from '@angular/core';
import { QrlHostService } from '@app/services/qrl-host/qrl-host.service';
@Component({
    selector: 'app-qrl-host-validation',
    templateUrl: './qrl-host-validation.component.html',
    styleUrls: ['./qrl-host-validation.component.scss'],
})
export class QrlHostValidationComponent {
    constructor(readonly qrlHost: QrlHostService) {}
    protected submitEval(note: number) {
        this.qrlHost.submitEval(note);
    }
}
