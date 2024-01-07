import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HeaderComponent } from '@app/components/header/header.component';
import { HistoryListComponent } from '@app/components/history-list/history-list.component';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { HistoryComponent } from './history.component';

describe('HistoryComponent', () => {
    let component: HistoryComponent;
    let fixture: ComponentFixture<HistoryComponent>;
    let gameHistoryServiceSpy: jasmine.SpyObj<GameHistoryService>;

    beforeEach(() => {
        gameHistoryServiceSpy = jasmine.createSpyObj('GameHistoryService', ['postGameHistory']);
        TestBed.configureTestingModule({
            declarations: [HistoryComponent, HeaderComponent, HistoryListComponent, MatPaginator],
            providers: [{ provide: GameHistoryService, useValue: gameHistoryServiceSpy }],
            imports: [MatDialogModule, MatTooltipModule],
        });
        fixture = TestBed.createComponent(HistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
