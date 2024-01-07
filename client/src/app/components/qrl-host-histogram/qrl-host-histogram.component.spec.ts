import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QrlHostHistogramComponent } from './qrl-host-histogram.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
describe('QrlHostHistogramComponent', () => {
    let component: QrlHostHistogramComponent;
    let fixture: ComponentFixture<QrlHostHistogramComponent>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QrlHostHistogramComponent],
            imports: [MatSnackBarModule],
        }).compileComponents();
        fixture = TestBed.createComponent(QrlHostHistogramComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
