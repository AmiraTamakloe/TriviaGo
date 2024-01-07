import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GameListComponent } from '@app/components/game-list/game-list.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { GameService } from '@app/services/game/game.service';
import { AdministrationPageComponent } from './administration-page.component';
import SpyObj = jasmine.SpyObj;

describe('AdministrationPageComponent', () => {
    let component: AdministrationPageComponent;
    let fixture: ComponentFixture<AdministrationPageComponent>;
    let gameServiceSpy: SpyObj<GameService>;

    beforeEach(() => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['gameInformation']);
        TestBed.configureTestingModule({
            declarations: [AdministrationPageComponent, HeaderComponent, GameListComponent, MatPaginator],
            providers: [{ provide: GameService, useValue: gameServiceSpy }],
            imports: [MatTooltipModule, MatDialogModule],
        });
        fixture = TestBed.createComponent(AdministrationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
