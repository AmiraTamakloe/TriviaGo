import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QrlResultsComponent } from './qrl-results.component';
describe('QrlResultsComponent', () => {
    let component: QrlResultsComponent;
    let fixture: ComponentFixture<QrlResultsComponent>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QrlResultsComponent],
        });
        fixture = TestBed.createComponent(QrlResultsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
