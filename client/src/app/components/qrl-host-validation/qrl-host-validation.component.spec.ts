import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QrlHostValidationComponent } from './qrl-host-validation.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
describe('QrlHostValidationComponent', () => {
    let component: QrlHostValidationComponent;
    let fixture: ComponentFixture<QrlHostValidationComponent>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QrlHostValidationComponent],
            imports: [MatSnackBarModule],
        }).compileComponents();
        fixture = TestBed.createComponent(QrlHostValidationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should submit note to host service when qrl evaluation button is clicked', () => {
        const note = 0.5;
        spyOn(component['qrlHost'], 'submitEval');
        component['submitEval'](note);
        expect(component['qrlHost'].submitEval).toHaveBeenCalledWith(note);
    });
});
