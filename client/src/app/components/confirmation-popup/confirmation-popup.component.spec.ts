import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmationPopupComponent } from './confirmation-popup.component';

describe('ConfirmationPopupComponent', () => {
    let component: ConfirmationPopupComponent;
    let fixture: ComponentFixture<ConfirmationPopupComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConfirmationPopupComponent],
            imports: [MatDialogModule],
        });
        fixture = TestBed.createComponent(ConfirmationPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('confirmAction should always return True', () => {
        const result = component.confirmAction();
        expect(result).toBeTrue();
    });
});
