import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { ChatBoxComponent } from '@app/components//chat-box/chat-box.component';
import { ButtonComponent } from '@app/components/button/button.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { QuestionDescriptionComponent } from '@app/components/question-description/question-description.component';
import { GameService } from '@app/services/game/game.service';
import { GamePageComponent } from './game-page.component';
import SpyObj = jasmine.SpyObj;
import { TimerControlComponent } from '@app/components/timer-control/timer-control.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let mockActivatedRoute: SpyObj<ActivatedRoute>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                GamePageComponent,
                ChatBoxComponent,
                PlayAreaComponent,
                PlayerInfoComponent,
                QuestionDescriptionComponent,
                ButtonComponent,
                TimerControlComponent,
                HistogramComponent,
            ],
            imports: [HttpClientModule, MatIconModule, MatSnackBarModule],
            providers: [GameService, { provide: ActivatedRoute, useValue: mockActivatedRoute }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
