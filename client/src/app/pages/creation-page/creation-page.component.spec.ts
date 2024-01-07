import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { GameDetailsComponent } from '@app/components/game-details/game-details.component';
import { GameListComponent } from '@app/components/game-list/game-list.component';

import { MatTooltipModule } from '@angular/material/tooltip';
import { HeaderComponent } from '@app/components/header/header.component';
import { GameService } from '@app/services/game/game.service';
import { CreationPageComponent } from './creation-page.component';

describe('CreationPageComponent', () => {
    let component: CreationPageComponent;
    let fixture: ComponentFixture<CreationPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CreationPageComponent, GameListComponent, GameDetailsComponent, HeaderComponent, MatPaginator],
            imports: [MatIconModule, MatDialogModule, HttpClientTestingModule, MatTooltipModule],
            providers: [GameService],
        });
        fixture = TestBed.createComponent(CreationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
