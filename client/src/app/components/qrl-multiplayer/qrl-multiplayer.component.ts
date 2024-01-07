import { Component, OnInit } from '@angular/core';
import { MatchManagementService } from '@app/services/match-management/match-management.service';
import { QrlCommonService } from '@app/services/qrl-common/qrl-common.service';
import { QrlState } from '@common/qrlState';
@Component({
    selector: 'app-qrl-multiplayer',
    templateUrl: './qrl-multiplayer.component.html',
    styleUrls: ['./qrl-multiplayer.component.scss'],
})
export class QrlMultiplayerComponent implements OnInit {
    readonly qrlState = QrlState;
    constructor(
        readonly matchManagementService: MatchManagementService,
        readonly qrlCommonService: QrlCommonService,
    ) {}
    ngOnInit() {
        this.qrlCommonService.newQrl();
    }
}
