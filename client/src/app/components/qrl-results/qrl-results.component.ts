import { Component } from '@angular/core';
import { QrlCommonService } from '@app/services/qrl-common/qrl-common.service';
@Component({
    selector: 'app-qrl-results',
    templateUrl: './qrl-results.component.html',
    styleUrls: ['./qrl-results.component.scss'],
})
export class QrlResultsComponent {
    constructor(readonly qrlCommonService: QrlCommonService) {}
}
