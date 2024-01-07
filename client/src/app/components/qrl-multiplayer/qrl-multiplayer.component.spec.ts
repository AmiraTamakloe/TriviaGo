import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QrlMultiplayerComponent } from './qrl-multiplayer.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { QrlHostHistogramComponent } from '@app/components/qrl-host-histogram/qrl-host-histogram.component';

describe('QrlMultiplayerComponent', () => {
    let component: QrlMultiplayerComponent;
    let fixture: ComponentFixture<QrlMultiplayerComponent>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QrlMultiplayerComponent, QrlHostHistogramComponent],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            params: {
                                id: 1,
                            },
                        },
                        queryParams: of({ organizer: 'true' }),
                    },
                },
            ],
            imports: [MatSnackBarModule, RouterModule, HttpClientTestingModule],
        }).compileComponents();
        fixture = TestBed.createComponent(QrlMultiplayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
